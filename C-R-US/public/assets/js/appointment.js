document.addEventListener('DOMContentLoaded', () => {
    console.log("appointment.js loaded");

    const timeButtons = document.querySelectorAll('.time-slot');
    const serviceButtons = document.querySelectorAll('.service-option');
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
    let selectedDate = ""; 

    const button = document.querySelector('#myButton');
    if (button) {
        if (bookedTimes.length === 0) {
          button.disabled = true;
          button.style.backgroundColor = 'grey';
          button.style.cursor = 'not-allowed'; // Optional: change cursor to indicate disabled
        } else {
          button.disabled = false;
          button.style.backgroundColor = '';
          button.style.cursor = 'pointer';
        }
      }

      async function fetchBookedTimes() {
        const response = await fetch('/getBookedTimes');
        if (response.ok) {
            const data = await response.json();
            bookedTimes = data.bookedTimes;
            const fullyBookedDates = data.fullyBookedDates || [];
    
            console.log("Booked times:", bookedTimes);
            console.log("Fully booked dates:", fullyBookedDates);
    
            updateTimeSlots();
            disableFullyBookedDates(fullyBookedDates);
        }
    }
    
    

    function updateTimeSlots() {
        const date = selectedDate.trim();
        let availableSlotFound = false;
    
        timeButtons.forEach(button => {
            const buttonTime = button.textContent.trim();
    
            const isBooked = bookedTimes.some(
                booking => booking.date === date && booking.time === buttonTime
            );
    
            if (isBooked) {
                button.disabled = true;
                button.classList.add('disabled');
                button.title = 'This time slot is already booked';
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
                button.title = '';
                availableSlotFound = true;
            }
        });
    
        const timeSlotContainer = document.getElementById('time-slot-container'); 
        if (!availableSlotFound) {
            timeSlotContainer.classList.add('fully-booked');
            timeSlotContainer.style.pointerEvents = 'none';
            timeSlotContainer.style.opacity = '0.5';
        } else {
            timeSlotContainer.classList.remove('fully-booked');
            timeSlotContainer.style.pointerEvents = '';
            timeSlotContainer.style.opacity = '';
        }
    }
    
    function disableFullyBookedDates(datesArray) {
        
        dateInput.addEventListener('input', () => {
            const selected = dateInput.value;
            if (datesArray.includes(selected)) {
                alert("All time slots are booked for this day. Please select another.");
                dateInput.value = ''; 
            }
        });
    
        dateInput.setAttribute('data-disabled-dates', JSON.stringify(datesArray)); 
    }
    

    dateInput.addEventListener('change', (event) => {
        selectedDate = event.target.value; 
        fetchBookedTimes(); 
    });

    timeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
    
            if (button.disabled) {
                errorMessage.textContent = "This time slot is already booked. Please choose another.";
                errorMessage.style.display = 'block';
                return;
            }
    
            timeButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
    
            button.classList.add('selected');
            hiddenTimeInput.value = button.textContent;
            errorMessage.style.display = 'none'; 
        });
    });
    

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
            selectedServicePrice = parseFloat(button.dataset.price);
        });
    });

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
    
        if (submitButton.disabled) return;
        submitButton.disabled = true;

        const appointmentDate = dateInput.value.trim();
        const appointmentTime = hiddenTimeInput.value.trim();
        const appointmentService = serviceInput.value.trim();
        const appointmentComment = comment.value.trim();

        if (bookedTimes.some(booking => booking.date === appointmentDate && booking.time === appointmentTime)) {
            alert("This time slot is already booked. Please choose another.");
            submitButton.disabled = false;
            return;
        }

        try {
            const response = await fetch('/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: appointmentDate,
                    time: appointmentTime,
                    service: appointmentService,
                    comment: appointmentComment
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error("Failed to book appointment. Server says: " + errorText);
            }

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('appointmentData', JSON.stringify({
                    date: appointmentDate,
                    time: appointmentTime,
                    service: appointmentService,
                    comment: appointmentComment,
                    status: 'pending', 
                    price: selectedServicePrice,
                }));
                window.location.href = '/checkout.html';
            } else {
                throw new Error("Server did not confirm success.");
            }

        } catch (error) {
            console.error("An error occurred during the booking process:", error);
        } finally {
            submitButton.disabled = false;
        }
    });
});