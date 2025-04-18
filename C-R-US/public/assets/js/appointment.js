document.addEventListener('DOMContentLoaded', () => {
    console.log("appointment.js loaded");

    const timeButtons = document.querySelectorAll('.time-slot');
    const serviceButtons = document.querySelectorAll('.service-option');
    const hiddenTimeInput = document.getElementById('time-of-appointment');
    const serviceInput = document.getElementById('service-of-appointment');
    const dateInput = document.getElementById('date-of-appointment');
    const submitButton = document.getElementById('submit-button');

    // Handle time selection
    timeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            timeButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('selected');
            button.setAttribute('aria-pressed', 'true');
            hiddenTimeInput.value = button.textContent;
            console.log("Time selected:", hiddenTimeInput.value);
        });
    });

    // Handle service selection
    serviceButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            serviceButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('selected');
            button.setAttribute('aria-pressed', 'true');
            serviceInput.value = button.dataset.value;
            console.log("Service selected:", serviceInput.value);
        });
    });

    // Form submission
    submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (!serviceInput.value.trim()) {
            alert('Please select a service.');
            return;
        }

        if (!dateInput.value.trim()) {
            alert('Please select a date.');
            return;
        }

        if (!hiddenTimeInput.value.trim()) {
            alert('Please select a time slot.');
            return;
        }

        try {
            const appointmentDate = dateInput.value.trim();
            const appointmentTime = hiddenTimeInput.value.trim();
            const appointmentService = serviceInput.value.trim();

            localStorage.setItem('appointmentDate', appointmentDate);
            localStorage.setItem('appointmentTime', appointmentTime);
            localStorage.setItem('appointmentService', appointmentService);

            window.location.href = "/checkout.html";
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.\n\n' + error.message);
        }
    });
});
