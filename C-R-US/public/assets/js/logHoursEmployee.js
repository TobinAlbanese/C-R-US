document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector('#timesheet tbody');
    const submitBut = document.querySelector('.buttonSubmitTimesheet');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let savedData = {};
    try {
        const res = await fetch('/api/log-hours');
        savedData = await res.json();

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

        const startTimeCell = document.createElement('td');
        const startTimeSelect = createTimeSelect(datestr, 'start');
        startTimeCell.appendChild(startTimeSelect);
        row.appendChild(startTimeCell);

        const endTimeCell = document.createElement('td');
        const endTimeSelect = createTimeSelect(datestr, 'end');
        endTimeCell.appendChild(endTimeSelect);
        row.appendChild(endTimeCell);

        const totalHoursCell = document.createElement('td');
        const totalHoursInput = document.createElement('input');
        totalHoursInput.type = 'number';
        totalHoursInput.readOnly = true;
        totalHoursInput.step = "0.01";
        totalHoursCell.appendChild(totalHoursInput);
        row.appendChild(totalHoursCell);

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
            startTimeSelect.value = savedData[datestr].startTime || '';
            endTimeSelect.value = savedData[datestr].endTime || '';
            totalHoursInput.value = savedData[datestr].totalHours || '';
            commentsInput.value = savedData[datestr].comments || '';
        }

        [startTimeSelect, endTimeSelect].forEach(input => {
            input.addEventListener('change', () => {
                const hours = autocalcTotalHours(startTimeSelect.value, endTimeSelect.value);
                totalHoursInput.value = hours;
            });
        });

        tbody.appendChild(row);
    }

    submitBut.addEventListener('click', async () => {
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

        const dataToSave = {};
        document.querySelectorAll('#timesheet tbody tr').forEach(row => {
            const date = row.dataset.date;
            const inputs = row.querySelectorAll('input, textarea');
            const [startInput, endInput, totalInput, commentsInput] = inputs;

            dataToSave[date] = {
                startTime: startInput.value,
                endTime: endInput.value,
                totalHours: totalInput.value,
                comments: commentsInput.value
            };
        });

        const response = await fetch('/api/log-hours', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        })
        
        const result = await response.json();

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
    else {
        return '';
    }
}

        function createTimeSelect(datestr, type) {
            const select = document.createElement('select');
            select.dataset.date = datestr;
            select.classList.add('time-select');
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '--:--';
            select.appendChild(defaultOption);
    
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const option = document.createElement('option');
                    const hourStr = hour.toString().padStart(2, '0');
                    const minuteStr = minute.toString().padStart(2, '0');
                    const timeValue = `${hourStr}:${minuteStr}`;
                    
                    option.value = timeValue;
                    option.textContent = timeValue;
                    select.appendChild(option);
                }
            }
            
            return select;
        }
