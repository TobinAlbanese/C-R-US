document.addEventListener('DOMContentLoaded', () => {
    console.log("appointment.js loaded");

    const timeButtons = document.querySelectorAll('.time-slot');
    const serviceButtons = document.querySelectorAll('.service-option');
    const calendarDays = document.querySelectorAll('.flatpickr-day');
    const hiddenTimeInput = document.getElementById('time-of-appointment');
    const serviceInput = document.getElementById('service-of-appointment');
    const dateInput = document.getElementById('date-of-appointment');
    const submitButton = document.getElementById('submit-button');
    const comment = document.getElementById('comments');

    let bookedTimes = [];
    let selectedServicePrice = 0;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Fetch and display past and upcoming appointments
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    async function pastApps() {
        try {
            const response = await fetch('/api/appsPast');
            if (!response.ok) throw new Error('Failed to fetch past apps');
            const data = await response.json();
            displayApps(data.past, 'past-appointments');
        } catch (error) {
            console.error('Error fetching past appointments:', error);
        }
    }

    async function upcomingApps() {
        try {
            const response = await fetch('/api/appsUpcoming');
            if (!response.ok) throw new Error('Failed to fetch upcoming apps');
            const data = await response.json();
            displayApps(data.upcoming, 'upcoming-appointments');
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
        }
    }

    function displayApps(appointments, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (appointments.length === 0) {
            container.innerHTML = `<div class="appointment-item">No appointments available.</div>`;
            return;
        }

        appointments.forEach(app => {
            const appointmentItem = document.createElement('div');
            appointmentItem.classList.add('appointment-item');
            appointmentItem.dataset.id = app._id;

            const appointmentDate = new Date(app.date).toLocaleDateString();
            appointmentItem.innerHTML = `
            <div class="appointment-text">${appointmentDate} at ${app.time} - ${app.service}</div>
        `;
        

            // Only add cancel button for upcoming appointments
            if (containerId === 'upcoming-appointments') {
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.classList.add('cancel-btn');
                cancelBtn.addEventListener('click', () => cancelAppointment(app._id, appointmentItem));
                appointmentItem.appendChild(cancelBtn);
            }

            container.appendChild(appointmentItem);
        });
    }

    async function cancelAppointment(id, appointmentElement) {
        if (!confirm('Cancel this appointment?')) return;

        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                appointmentElement.remove();
                alert('Appointment canceled.');
            } else {
                alert(data.error || 'Failed to cancel appointment.');
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('An error occurred while canceling.');
        }
    }

    pastApps();
    upcomingApps();

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Fetch booked times for selected date
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    async function fetchBookedTimes(date) {
        const response = await fetch(`/api/booked-times?date=${date}`);
        const data = await response.json();
        return data.bookedTimes;
    }

    async function updateTimeSlots() {
        const selectedDate = dateInput.value.trim();
        if (!selectedDate) return;

        bookedTimes = await fetchBookedTimes(selectedDate);

        timeButtons.forEach(button => {
            const timeSlot = button.textContent.trim();
            if (bookedTimes.includes(timeSlot)) {
                button.classList.add('disabled');
                button.disabled = true;
                button.style.backgroundColor = "#36454F";
                button.style.color = "white";
            } else {
                button.classList.remove('disabled');
                button.disabled = false;
                button.style.backgroundColor = "";
                button.style.color = "";
            }
        });
    }

    dateInput.addEventListener('change', updateTimeSlots);

    flatpickr("#date-of-appointment", {
        inline: true,
        minDate: "today",
        onChange: function(dateStr, instance) {
            fetchBookedTimes(dateStr).then(bookedTimes => {
                const allSlotsBooked = bookedTimes.length === timeButtons.length;
                if (allSlotsBooked) {
                    instance.daysContainer.querySelectorAll('.flatpickr-day').forEach(day => {
                        if (day.getAttribute('aria-label') === dateStr) {
                            day.classList.add('disabled');
                        }
                    });
                }
            });
        }
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Service selection and pricing
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    serviceButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            serviceButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const serviceName = button.getAttribute('data-value');
            selectedServicePrice = parseFloat(button.getAttribute('data-price'));
            serviceInput.value = serviceName;
        });
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Appointment submission
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    submitButton.addEventListener('click', async event => {
        event.preventDefault();

        if (!serviceInput.value.trim() || !dateInput.value.trim() || !hiddenTimeInput.value.trim()) {
            alert('Please complete all appointment fields.');
            return;
        }

        if (typeof selectedServicePrice === 'undefined') {
            alert('Please select a service with a valid price.');
            return;
        }

        if (submitButton.disabled) return;
        submitButton.disabled = true;

        const appointmentData = {
            date: dateInput.value.trim(),
            time: hiddenTimeInput.value.trim(),
            service: serviceInput.value.trim(),
            comment: comment.value.trim(),
            status: 'pending',
            price: selectedServicePrice,
            appointmentId: generateObjectId(),
        };

        localStorage.setItem('appointmentData', JSON.stringify(appointmentData));
        window.location.href = '/checkout.html';
    });

    function generateObjectId() {
        const timestamp = Math.floor(Date.now() / 1000).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
            (Math.random() * 16 | 0).toString(16)
        ).toLowerCase();
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // UI Hover Effects
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    timeButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('disabled')) {
                button.style.backgroundColor = '#437fb8';
                button.style.color = 'white';
            }
        });
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('disabled')) {
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        });
    });

    calendarDays.forEach(day => {
        day.addEventListener('mouseenter', () => {
            if (!day.classList.contains('disabled')) {
                day.style.backgroundColor = '#437fb8';
                day.style.color = 'white';
            }
        });
        day.addEventListener('mouseleave', () => {
            if (!day.classList.contains('disabled')) {
                day.style.backgroundColor = '';
                day.style.color = '';
            }
        });
    });

    serviceButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('disabled')) {
                button.style.backgroundColor = '#437fb8';
                button.style.color = 'white';
            }
        });
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('disabled')) {
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        });
    });
});
