

document.addEventListener("DOMContentLoaded", function () {
    const monthYear = document.getElementById("month-year");
    const calendarGrid = document.getElementById("calendar-grid");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
  
    let currentDate = new Date();

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
          const { date, time, service, comments, user } = event;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push({ time, service, comments, user });
          return acc;
        }, {});
    
        console.log("Transformed events:", events); // Log the transformed events
        renderCalendar(currentDate); // Re-render the calendar after fetching events
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }



      // ---------------EX. DELETE THIS BLOCK WHEN DB IS WORKING--------------------
      async function fetchEvents() {
        try {
          // Example data to force-load
          events = {
            "2025-04-14": [
              { user: "Susan", time: "08:00 AM", service: "Dental Exam", comments: "Pain in lower right teeth." },
              { user: "Bob", time: "10:00 AM", service: "Dental Exam", comments: "Pain in top molars." }
            ],
            "2025-04-24": [
              { user: "Jerry", time: "08:00 AM", service: "Dental Cleanings & Prevention", comments: "Routine check up." },
              { user: "Barbara", time: "09:00 AM", service: "Dental Cleanings & Prevention", comments: "Routine check up." },
              { user: "Mike", time: "10:00 AM", service: "Dental Exam", comments: "Client concern: Blemish on front teeth." }
            ],
            "2025-04-26": [
              { user: "Susan", time: "10:00 AM", service: "Composite Filling", comments: "Cavity in lower right molar." }
            ],
          };
          renderCalendar(currentDate); // Re-render the calendar with example data
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
      // ---------------EX. DELETE THIS BLOCK WHEN DB IS WORKING--------------------

      

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
    
              // Store event details in data attributes for later use
              eventBar.dataset.user = event.user;
              eventBar.dataset.time = event.time;
              eventBar.dataset.service = event.service;
              eventBar.dataset.comments = event.comments;
    
              const eventText = document.createElement("span");
              eventText.classList.add("event-text");
              eventText.textContent = `${event.time} - ${event.service}`;
    
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
    
          // Extract event details from data attributes
          const user = this.dataset.user;
          const time = this.dataset.time;
          const service = this.dataset.service;
          const comments = this.dataset.comments;
    
          // Show the custom pop-up with the event details
          showCustomPopup(
            `User: <strong>${user}</strong><br>Time: <strong>${time}</strong><br>Service: <strong>${service}</strong><br>Comments: <strong>${comments}</strong>`
          );
        });
      });
    }
  
  function showCustomPopup(message) {
    const popup = document.getElementById("custom-popup");
    const popupMessage = document.getElementById("popup-message");
    const confirmButton = document.getElementById("popup-confirm");
    const overlay = document.getElementById("popup-overlay");
  
    // Set the message
    popupMessage.innerHTML = message;
  
    // Show the pop-up and overlay
    popup.classList.remove("hidden");
    overlay.classList.remove("hidden");
  
    // Handle Confirm Button Click
    confirmButton.onclick = () => {
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
  