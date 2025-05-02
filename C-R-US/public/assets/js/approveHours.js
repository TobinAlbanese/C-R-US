document.addEventListener("DOMContentLoaded", async () => {
    const hoursTableBody = document.querySelector('#hoursTable tbody'); // Select the table body
    const approveButton = document.querySelector('.buttonApprove'); // Select the Approve button

    // Fetch logged hours from the backend
    async function fetchLoggedHours() {
        try {
            const res = await fetch('/api/log-hours'); // Call the backend API
            if (!res.ok) throw new Error('Failed to fetch logged hours');
            const loggedHours = await res.json();
            return loggedHours;
        } catch (error) {
            console.error('Error fetching logged hours:', error);
            return [];
        }
    }

    // Render logged hours in the table
    async function renderLoggedHours() {
        const loggedHours = await fetchLoggedHours();
        hoursTableBody.innerHTML = ''; // Clear the table before rendering

        loggedHours.forEach(hour => {
            const pay = (parseFloat(hour.totalHours) * 20).toFixed(2); // Calculate pay ($20/hour)
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hour.firstName} ${hour.lastName}</td> <!-- First and Last Name -->
                <td>${hour.date} (${hour.startTime} - ${hour.endTime})</td> <!-- Time Logged -->
                <td>$${pay}</td> <!-- Calculated Pay -->
                <td><input type="checkbox" class="select-checkbox" data-id="${hour._id}"></td> <!-- Select Checkbox -->
            `;
            hoursTableBody.appendChild(row);
        });
    }

    // Approve selected hours
    async function approveSelectedHours() {
        const selectedCheckboxes = document.querySelectorAll('.select-checkbox:checked'); // Get all checked checkboxes
        const approvedHours = Array.from(selectedCheckboxes).map(checkbox => {
            const row = checkbox.closest('tr'); // Get the row of the checkbox
            const cells = row.querySelectorAll('td'); // Get all cells in the row
            return {
                firstName: cells[0].textContent.split(' ')[0], // Extract first name
                lastName: cells[0].textContent.split(' ')[1], // Extract last name
                timeLogged: cells[1].textContent, // Extract time logged
                calculatedPay: cells[2].textContent.replace('$', ''), // Extract calculated pay
                id: checkbox.dataset.id // Get the ID from the checkbox
            };
        });

        try {
            const res = await fetch('/api/approve-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(approvedHours)
            });
            if (!res.ok) throw new Error('Failed to approve hours');
            console.log('Approved hours successfully sent to the database.');
            await renderLoggedHours(); // Refresh the table
        } catch (error) {
            console.error('Error approving hours:', error);
        }
    }

    // Add event listener to the Approve button
    approveButton.addEventListener('click', approveSelectedHours);

    // Initial render
    await renderLoggedHours();
});