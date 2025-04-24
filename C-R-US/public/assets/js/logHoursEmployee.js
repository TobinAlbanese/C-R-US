document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector('#timesheet tbody');
    const submitButton = document.getElementById('buttonSubmitTimesheet');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const datestr = date.toISOString().split('T')[0];

        const row = document.createElement('tr');
        row.dataset.date = datestr;
        const datecell = document.createElement('td');

        datecell.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        row.appendChild(datecell);

        const startTimeCell = document.createElement('td');
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'time';
        //ffwi
        startTimeInput.dataset.date = datestr;
        startTimeCell.appendChild(startTimeInput);
        row.appendChild(startTimeCell);

        const endTimeCell = document.createElement('td');
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'time';
        //fjiwo
        endTimeInput.dataset.date = datestr;
        endTimeCell.appendChild(endTimeInput);
        row.appendChild(endTimeCell);

        const totalHoursCell = document.createElement('td');
        const totalHoursInput = document.createElement('input');
        totalHoursInput.type = 'number';
        //fijwo
        totalHoursInput.readOnly = true;
        totalHoursInput.step = "0.01";
        totalHoursCell.appendChild(totalHoursInput);
        row.appendChild(totalHoursCell);

        const commentsCell = document.createElement('td');
        const commentsInput = document.createElement('textarea');
        //commentsInput.type = 'commentsInput';
        commentsInput.dataset.date = datestr;
        commentsInput.rows = 1;
        commentsInput.cols = 20;
        commentsCell.appendChild(commentsInput);
        row.appendChild(commentsCell);


        [startTimeInput, endTimeInput].forEach(input => {
            input.addEventListener('change', () => {
                const hours = autocalcTotalHours(startTimeInput.value, endTimeInput.value);
                totalHoursInput.value = hours;
            })
        })

        tbody.appendChild(row);
    }
});

//automatically calculates the Total Hours worked.
//reference from: https://connect.formidableforms.com/question/category/general-questions/javascript-to-calculate-the-date-and-time-difference/
function autocalcTotalHours(startTime, endTime) {
    if (startTime != '' && endTime != ''){
        const startTime = startTime.split(':');
        const endTime = endTime.split(':');
        var startTimeHours = startTime[0];
        var startTimeMins = startTime[1];
        var endTimeHours = endTime[0];
        var endTimeMins = endTime[1];

        var startDate = new Date (0, 0, 0, startTimeHours, startTimeMins, 0);
        var endDate = new Date (0, 0, 0, endTimeHours, endTimeMins, 0);
        var timeDiff = endDate.getTime() - startDate.getTime();
        var hours = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(timeDiff / 1000 / 60);
        minutes = (minutes < 9 ? "00" : minutes);
        numb = hours + (minutes/60);
    }
    else {
        return '';
    }
}