document.addEventListener("DOMContentLoaded", async () => {
    
    const deleteButton = document.getElementById('delete-timeOffs');

    //functionality for approve button
    if(deleteButton) {
        deleteButton.addEventListener("click", (e_) => {
            e_.preventDefault();
            deleteTimeOff();
        });
    }else {
        alert("FAILED to submit button");
    }
    
    //Get for the time offs that employees have submitted 
    try {
        const res = await fetch("/api/assign-time-off");
        const data = await res.json();

        if (data.success) {
            const container = document.querySelector(".container2");
            if (!container) {
                console.error("Container not found!");
                return;
            }
            container.innerHTML = "";

            data.timeOffs.forEach((timeOff) => {
                console.log("TimeOff:", timeOff);

                const row = document.createElement("div");
                row.className = "task-row"; 

                const typeDiv = document.createElement("div");
                typeDiv.textContent = timeOff.timeOffType || "N/A";

                const employeeDiv = document.createElement("div");
                employeeDiv.textContent = timeOff.Employee || "N/A";

                const commentsDiv = document.createElement("div");
                commentsDiv.textContent = timeOff.timeOffComments || "N/A";

                const timeOffDate = document.createElement("div");
                timeOffDate.textContent = timeOff.timeOffDate;

                const timeOffStartTime = document.createElement("div");
                timeOffStartTime.textContent = timeOff.timeOffStartTime;

                const timeOffEndTime = document.createElement("div");
                timeOffEndTime.textContent = timeOff.timeOffEndTime;

                //Need time off id to do delete, succefully hides as an input
                const timeOffId = document.createElement("input");
                timeOffId.textContent = timeOff._id;
                timeOffId.type = "hidden";

                const selectDiv = document.createElement("div");
                const checkBox = document.createElement('input');
                checkBox.type = 'checkbox';
                selectDiv.appendChild(checkBox);

                row.appendChild(typeDiv);
                row.appendChild(employeeDiv);
                row.appendChild(commentsDiv);
                row.appendChild(timeOffDate);
                row.appendChild(timeOffStartTime);
                row.appendChild(timeOffEndTime);
                row.appendChild(timeOffId);
                row.appendChild(selectDiv);

                
        
                

                container.appendChild(row);
            });
            
    }
    } catch (err) {
        console.error("Error loading timeOffs: at imrans part", err);
    }
});

//Used with the approve button, so far it just gets rid of the item from TimeOffEmployee Collection in MongoDB
async function deleteTimeOff() {
    const selectedTasks = document.querySelectorAll(".task-row input[type='checkbox']:checked");
    if (selectedTasks.length === 0) {
        alert("Please select at least one task to delete.");
        return;
    }

    const TimeOffs = Array.from(selectedTasks).map(checkbox => checkbox.closest('.task-row').querySelector('div:nth-child(2)').textContent.trim());
    console.log(TimeOffs);
    try {
        const res = await fetch("/api/delete-timeOff", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ TimeOffs })
        });

        const result = await res.json();
        if (result.success) {
            alert("Tasks deleted successfully!");
            window.location.reload(); // Reload to see the changes
        } else {
            alert("Failed to delete tasks: " + result.message);
        }
    } catch (error) {
        console.error("Error deleting tasks:", error);
        alert("An error occurred while deleting the tasks.");
    }
    
}

