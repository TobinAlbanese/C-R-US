

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

    fetchEvents();
  
    function renderCalendar(date) {
      calendarGrid.innerHTML = "";
  
      const year = date.getFullYear();
      const month = date.getMonth();
  
      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, ..., 6 = Sat
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
      monthYear.textContent = `${date.toLocaleString("default", { month: "long" })} ${year}`;
  
      const totalCells = firstDay + daysInMonth;
      for (let i = 0; i < totalCells; i++) {
        const dayCell = document.createElement("div");
        dayCell.classList.add("day");
  
        if (i >= firstDay) {
          const dayNum = i - firstDay + 1;
          const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  
          dayCell.innerHTML = `<div class="date">${dayNum}</div>`;
  
          if (events[fullDate]) {
            dayCell.classList.add("event");
            dayCell.setAttribute("data-event", events[fullDate]);
          
            const eventBar = document.createElement("div");
            eventBar.classList.add("event-bar");

            const eventText = document.createElement("span");
            eventText.classList.add("event-text");
            eventText.textContent = events[fullDate];

            eventBar.appendChild(eventText);
            dayCell.appendChild(eventBar);
          }
        }
  
        calendarGrid.appendChild(dayCell);
      }
  
      attachEventHandlers();
    }
  
    function attachEventHandlers() {
      const eventDays = document.querySelectorAll(".day.event");
      eventDays.forEach(day => {
        day.addEventListener("click", function () {
          const eventName = this.getAttribute("data-event");
          const confirmed = confirm(`Are you sure you want to take this task: "${eventName}"?`);
          if (confirmed) {
            alert(`You accepted the task: "${eventName}"`);
          }
        });
      });
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
  