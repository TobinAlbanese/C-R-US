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
    const errorMessage = document.createElement('p');
    errorMessage.id = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none'; 
    document.body.appendChild(errorMessage);
    let bookedTimes = [];
    let selectedServicePrice = 0;

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// fetch past & upcomign appointments
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
async function pastApps() {
    const response = await fetch('/api/appsPast');
    const data = await response.json();
    displayApps(data.past, 'past-appointments');
}
async function upcomingApps() {
    const response = await fetch('/api/appsUpcoming');
    const data = await response.json();
    displayApps(data.upcoming, 'upcoming-appointments');
}
function displayApps(appointments, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 
    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p>No appointments found.</p>';
        return;
    }
    appointments.forEach(app => {
        const div = document.createElement('div');
        div.innerHTML = `
        <p><strong>${app.service}</strong> on ${app.date} at ${app.time}</p>
        <p>Status: ${app.status}</p>
        <p>Comments: ${app.comments}</p>
        `;
    container.appendChild(div);
  });
}
pastApps();
upcomingApps();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// calendar section for taken dates
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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
                button.style.color = "	white";            
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
        onChange: function( dateStr, instance) {
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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Select Service and Price
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        serviceButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const serviceName = event.target.getAttribute('data-value');
                selectedServicePrice = parseFloat(event.target.getAttribute('data-price'));
                serviceInput.value = serviceName; 
                console.log(`Selected Service: ${serviceName}, Price: $${selectedServicePrice}`);
            });
        });


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// backend logic for sending the appointment data & checkout data
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    submitButton.addEventListener('click', async (event) => {
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

        if (typeof selectedServicePrice === 'undefined') {
            alert('Please select a service with a valid price.');
            return;
        }

        if (submitButton.disabled) return;
        submitButton.disabled = true;
    
        const appointmentDate = dateInput.value.trim();
        const appointmentTime = hiddenTimeInput.value.trim();
        const appointmentService = serviceInput.value.trim();
        const appointmentComment = comment.value.trim();

        function generateObjectId() {
            const timestamp = Math.floor(Date.now() / 1000).toString(16);
            return (
                timestamp +
                'xxxxxxxxxxxxxxxx'
                    .replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16))
                    .toLowerCase()
            );
        }
        const appointmentId = generateObjectId();

        if (bookedTimes.some(booking => booking.date === appointmentDate && booking.time === appointmentTime )) {
            alert("This time slot is already booked. Please choose another.");
            submitButton.disabled = false;
            return;
        }
    
        localStorage.setItem('appointmentData', JSON.stringify({
            date: appointmentDate,
            time: appointmentTime,
            service: appointmentService,
            comment: appointmentComment,
            status: 'pending', 
            price: selectedServicePrice,
            appointmentId: appointmentId,
        }));
    
        window.location.href = '/checkout.html';
    });


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Hover Effects
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    timeButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('disabled')) {
                button.style.backgroundColor = '		#437fb8';
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
                button.style.backgroundColor = '	#437fb8';
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
