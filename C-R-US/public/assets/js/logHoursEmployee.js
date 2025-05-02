document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector('#timesheet tbody');
    const submitBut = document.querySelector('.buttonSubmitTimesheet');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let savedData = {};
    try {
        const response = await fetch('/api/log-hours');
        if (!response.ok) throw new Error ('Failed to load data');
        savedData = await response.json();
    }
    catch (err) {
        console.error(err);
    }

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
        
        const startTimeCell = createInputCell('time', datestr);
        const endTimeCell = createInputCell('time', datestr);
        const totalHoursCell = createInputCell('number', datestr, true); // read-only
        totalHoursCell.querySelector('input').step = "0.01";

        const commentsCell = document.createElement('td');
        const commentsInput = document.createElement('textarea');
        commentsInput.dataset.date = datestr;
        commentsInput.rows = 1;
        commentsInput.cols = 20;
        commentsCell.appendChild(commentsInput);
        row.appendChild(startTimeCell);
        row.appendChild(endTimeCell);
        row.appendChild(totalHoursCell);
        row.appendChild(commentsCell);

        if (savedData[datestr]) {
            startTimeCell.querySelector('input').value = savedData[datestr].startTime || '';
            endTimeCell.querySelector('input').value = savedData[datestr].endTime || '';
            totalHoursCell.querySelector('input').value = savedData[datestr].totalHours || '';
            commentsInput.value = savedData[datestr].comments || '';
        }

        [startTimeCell, endTimeCell].forEach(cell => {
            const input = cell.querySelector('input');
            input.addEventListener('change', () => {
                const start = startTimeCell.querySelector('input').value;
                const end = endTimeCell.querySelector('input').value;
                const hours = autocalcTotalHours(start, end);
                totalHoursCell.querySelector('input').value = hours;
            });
        });

        tbody.appendChild(row);
    }

    submitBut.addEventListener('click', () => {
        const rows = document.querySelectorAll('#timesheet tbody tr');
        const dataToSave = {};

        rows.forEach(row => {
            const date = row.dataset.date;
            const [startInput, endInput, totalInput] = row.querySelectorAll('input[type="time"], input[type="number"]');
            const commentsInput = row.querySelector('textarea');
            const hasData = [startInput, endInput, totalInput, commentsInput].some(input => input.value.trim() !== "");

            if (hasData) {
                [startInput, endInput, totalInput, commentsInput].forEach(input => {
                    input.disabled = true;
                    input.classList.add('locked-input');
                });
                row.classList.add('locked-input');

                dataToSave[date] = {
                    startTime: startInput.value,
                    endTime: endInput.value,
                    totalHours: totalInput.value,
                    comments: commentsInput.value
                };
            }
        });
        fetch('/api/log-hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        })
        .then(() => {
            document.getElementById('statusMessage').textContent = 'Timesheet submitted successfully!';
        })
        .catch(error => {
            console.error('Error saving timesheet:', error);
            document.getElementById('statusMessage').textContent = 'Error saving timesheet.';
        });
    });
});

function createInputCell(type, date, readOnly = false) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.dataset.date = date;
    if (readOnly) input.readOnly = true;
    cell.appendChild(input);
    return cell;
}

function autocalcTotalHours(start, end) {
    if (start && end) {
        const [startHours, startMins] = start.split(':').map(Number);
        const [endHours, endMins] = end.split(':').map(Number);
        const startDate = new Date(0, 0, 0, startHours, startMins);
        const endDate = new Date(0, 0, 0, endHours, endMins);
        let timeDiff = (endDate - startDate) / (1000 * 60 * 60);
        return timeDiff >= 0 ? timeDiff.toFixed(2) : '';
    }
    return '';
}