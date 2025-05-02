document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector('#timesheet tbody');
    const submitBut = document.querySelector('.buttonSubmitTimesheet');
    const seePayrollBut = document.querySelector('.seePayroll');
    const timesheetTable = document.querySelector('.timesheetTable');
    const payrollContainer = document.querySelector('.payroll-container');

      
    let existingData = [];
    try {
        const res = await fetch('/api/logged-hours', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.logs)) {
        existingData = data.logs;
        }
    } catch (err) {
        console.error('Error fetching existing data:', err);
    }
    const logMap = new Map();
    existingData.forEach(log => 
        logMap.set(log.date, log));


    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
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

        const startTimeSelect = createTimeSelect(datestr, 'start');
        const endTimeSelect = createTimeSelect(datestr, 'end');

        const startTimeCell = document.createElement('td');
        const endTimeCell = document.createElement('td');
        startTimeCell.appendChild(startTimeSelect);
        endTimeCell.appendChild(endTimeSelect);

        const totalHoursCell = document.createElement('td');
        const totalHoursInput = document.createElement('input');
        totalHoursInput.type = 'number';
        totalHoursInput.readOnly = true;
        totalHoursInput.step = "0.01";
        totalHoursCell.appendChild(totalHoursInput);

        const commentsCell = document.createElement('td');
        const commentsInput = document.createElement('textarea');
        commentsInput.dataset.date = datestr;
        commentsInput.rows = 1;
        commentsInput.cols = 20;
        commentsCell.appendChild(commentsInput);

        [startTimeSelect, endTimeSelect].forEach(input => {
            input.addEventListener('change', () => {
                const hours = autocalcTotalHours(startTimeSelect.value, endTimeSelect.value);
                totalHoursInput.value = hours;
            });
        });
        if (logMap.has(datestr)) {
            const log = logMap.get(datestr);
            startTimeSelect.value = log.startTime || '';
            endTimeSelect.value = log.endTime || '';
            totalHoursInput.value = log.totalHours || '';
            commentsInput.value = log.comments || '';
            [startTimeSelect, endTimeSelect, totalHoursInput, commentsInput].forEach(input => {
                input.disabled = true;
                input.classList.add('locked-input');
            });
            row.classList.add('locked-input');
        }

        row.appendChild(startTimeCell);
        row.appendChild(endTimeCell);
        row.appendChild(totalHoursCell);
        row.appendChild(commentsCell);
        tbody.appendChild(row);
    }

    submitBut.addEventListener('click', async () => {
        const rows = document.querySelectorAll('#timesheet tbody tr');
        const dataToSave = [];

        rows.forEach(row => {
            const [startInput, endInput] = row.querySelectorAll('select');
            const totalInput = row.querySelector('input[type="number"]');
            const commentsInput = row.querySelector('textarea');

            const hasData = [startInput, endInput, totalInput, commentsInput].some(input => input.value.trim() !== "");

            if (hasData) {
                [startInput, endInput, totalInput, commentsInput].forEach(input => {
                    input.disabled = true;
                    input.classList.add('locked-input');
                });
                row.classList.add('locked-input');

                dataToSave.push({
                    date: row.dataset.date,
                    startTime: startInput.value,
                    endTime: endInput.value,
                    totalHours: totalInput.value,
                    comments: commentsInput.value
            });
            }
        });
        console.log('Data to save:', dataToSave);
        const result = await postLogHours(dataToSave);
        if (result) {
            console.log("Log hours saved successfully.");
        } else {
            console.error("Failed to save log hours.");
        }
    });


function autocalcTotalHours(start, end) {
    if (start && end) {
        const [startHours, startMins] = start.split(':').map(Number);
        const [endHours, endMins] = end.split(':').map(Number);
        const startDate = new Date(0, 0, 0, startHours, startMins);
        const endDate = new Date(0, 0, 0, endHours, endMins);
        let timeDiff = (endDate - startDate) / (1000 * 60 * 60);
        return timeDiff >= 0 ? timeDiff.toFixed(2) : '';
    } else {
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

async function postLogHours(data) {
    try {
        const res = await fetch('/api/log-hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), 
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to save log hours');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}


async function togglePayroll () {
    console.log('Toggle Payroll button clicked'); // Debugging log
    timesheetTable.classList.toggle('hidden');
    payrollContainer.classList.toggle('visible');

    if (timesheetTable.classList.contains('hidden')) {
        seePayrollBut.textContent = 'See Timesheet';
        await loadPayrollData();
    }
    else {
        seePayrollBut.textContent = 'See Payroll';
    }
}

async function loadPayrollData() {
    try {
        const response = await fetch('/api/approvedHours', {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load payroll data');
        
        const payrollData = await response.json();
        displayPayrollData(payrollData);
    } catch (error) {
        console.error('Error loading payroll data:', error);
        document.getElementById('payrollData').innerHTML = 
            '<p>Error loading payroll information. Please try again later.</p>';
    }
}

function displayPayrollData(data) {
    const payrollDataElement = document.getElementById('payroll-data'); // Select the payroll table container

    let html = `
        <table class="payroll-table">
            <thead>
                <tr>
                    <th>Time Logged</th>
                    <th>Calculated Pay</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Loop through the data and create table rows
    data.forEach(period => {
        html += `
            <tr>
                <td>${period.timeLogged}</td>
                <td>$${parseFloat(period.calculatedPay).toFixed(2)}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    payrollDataElement.innerHTML = html; // Insert the table into the container
}

seePayrollBut.addEventListener('click', togglePayroll);
});