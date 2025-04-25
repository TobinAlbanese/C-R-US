

document.addEventListener("DOMContentLoaded", function () {
    const monthYear = document.getElementById("month-year");
    const calendarGrid = document.getElementById("calendar-grid");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
  
    let currentDate = new Date();
  
    let events = {
        

    };



    async function fetchEvents() {
        try {
          const response = await fetch("/api/Scheduling");
          if (!response.ok) {
            throw new Error("Failed to fetch events");
          }
          const data = await response.json();
          console.log("Fetched events from API:", data); // Log the fetched data
      
          // Transform the data into the format expected by the calendar
          events = data.reduce((acc, event) => {
            acc[event.date] = event.client;
            return acc;
          }, {});
         
        

          
          
          console.log("Transformed events:", events); // Log the transformed events
          renderCalendar(currentDate); // Re-render the calendar after fetching events
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }

      // EX. DELETE THIS
      async function fetchEvents() {
        try {
          // Example data to force-load
          events = {
            "2025-04-14": [
              { time: "08:00 AM", description: "Dental Exams" },
              { time: "02:00 PM", description: "Team Meeting" },
              { time: "03:00 PM", description: "Team Meeting" },
              { time: "04:00 PM", description: "Team Meeting" },
              { time: "05:00 PM", description: "Team Meeting" },
              { time: "06:00 PM", description: "Team Meeting" }
            ],
            "2025-04-24": [
              { time: "08:00 AM", description: "Dental Exams" },
              { time: "02:00 PM", description: "Team Meeting" },
              { time: "03:00 PM", description: "Team Meeting" },
              { time: "04:00 PM", description: "Team Meeting" },
              { time: "05:00 PM", description: "Team Meeting" },
              { time: "06:00 PM", description: "Team Meeting" }
            ],
            "2025-04-26": [
              { time: "10:00 AM", description: "Project Deadline" }
            ],
            "2025-04-30": [
              { time: "08:00 AM", description: "Dental Exams" },
              { time: "02:00 PM", description: "Team Meeting" },
              { time: "03:00 PM", description: "Team Meeting" },
              { time: "04:00 PM", description: "Team Meeting" },
              { time: "05:00 PM", description: "Team Meeting" },
              { time: "06:00 PM", description: "Team Meeting" }
            ],
          };
      
          renderCalendar(currentDate); // Re-render the calendar with example data
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
    fetchEvents();
  
    function renderCalendar(date) {
      calendarGrid.innerHTML = "";
    
      const year = date.getFullYear();
      const month = date.getMonth();
    
      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, ..., 6 = Sat
      const daysInMonth = new Date(year, month + 1, 0).getDate();
    
      monthYear.textContent = `${date.toLocaleString("default", { month: "long" })} ${year}`;
    
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
      const totalCells = firstDay + daysInMonth;
      for (let i = 0; i < totalCells; i++) {
        const dayCell = document.createElement("div");
        dayCell.classList.add("day");
    
        if (i >= firstDay) {
          const dayNum = i - firstDay + 1;
          const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    
          dayCell.innerHTML = `<div class="date">${dayNum}</div>`;
    
          // Check if the current day matches the rendered day
          if (fullDate === todayString) {
            dayCell.classList.add("current-day");
          }
    
          // Render events for the day
          if (events[fullDate]) {
            dayCell.classList.add("event");
            events[fullDate].forEach(event => {
              const eventBar = document.createElement("div");
              eventBar.classList.add("event-bar");
    
              const eventText = document.createElement("span");
              eventText.classList.add("event-text");
              eventText.textContent = `${event.time} - ${event.description}`;
    
              eventBar.appendChild(eventText);
              dayCell.appendChild(eventBar);
            });
          }
        }
    
        calendarGrid.appendChild(dayCell);
      }
    
      attachEventHandlers();
    }
    
    function attachEventHandlers() {
      const eventBars = document.querySelectorAll(".event-bar"); // Select only the event bars
      eventBars.forEach(eventBar => {
        eventBar.addEventListener("click", function (event) {
          event.stopPropagation(); // Prevent the click from bubbling up to parent elements
          const eventName = this.textContent; // Get the event name from the text content
    
          // Show the custom pop-up
          showCustomPopup(`Are you sure you want to take this task: "${eventName}"?`, () => {
            alert(`You accepted the task: "${eventName}"`);
          });
        });
      });
    }
  
  function showCustomPopup(message, onConfirm) {
    const popup = document.getElementById("custom-popup");
    const popupMessage = document.getElementById("popup-message");
    const confirmButton = document.getElementById("popup-confirm");
    const cancelButton = document.getElementById("popup-cancel");
    const overlay = document.getElementById("popup-overlay");
  
    // Set the message
    popupMessage.textContent = message;
  
    // Show the pop-up and overlay
    popup.classList.remove("hidden");
    overlay.classList.remove("hidden");
  
    // Handle Confirm Button Click
    confirmButton.onclick = () => {
      popup.classList.add("hidden"); // Hide the pop-up
      overlay.classList.add("hidden"); // Hide the overlay
      if (onConfirm) onConfirm(); // Call the confirm callback
    };
  
    // Handle Cancel Button Click
    cancelButton.onclick = () => {
      popup.classList.add("hidden"); // Hide the pop-up
      overlay.classList.add("hidden"); // Hide the overlay
    };
  
    // Close the pop-up if the overlay is clicked
    overlay.onclick = () => {
      popup.classList.add("hidden");
      overlay.classList.add("hidden");
    };
  }
  
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
  
    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  
    renderCalendar(currentDate);
  });
  