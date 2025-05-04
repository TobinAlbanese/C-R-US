document.addEventListener("DOMContentLoaded", async () => {
   
    const submitButton = document.getElementById('submit-Tasks');

    
        if(submitButton) {
            submitButton.addEventListener("click", taskSubmission);
        }else {
            alert("FAILED to submit button");
        }
        

    try {
        const res = await fetch("/api/assign-tasks");
        const data = await res.json();

        if (data.success) {
            const container = document.querySelector(".container2");
            if (!container) {
                console.error("Container not found!");
                return;
            }
            container.innerHTML = "";

            const employees = data.users.filter(user => user.role === "employee");
            const admins = data.users.filter(user => user.role === "admin");

            data.tasks.forEach((task) => {
                console.log("Task:", task);

                const row = document.createElement("div");
                row.className = "task-row"; 

                const typeDiv = document.createElement("div");
                typeDiv.textContent = task.type || "N/A";

                const assignToDiv = document.createElement("div");
                assignToDiv.appendChild(createEmployeeDropdown(employees, task.assignTo));

                const assignedByDiv = document.createElement("div");
                assignedByDiv.appendChild(createAdminDropdown(admins, task.assignedBy));

                const createdOnDiv = document.createElement("div");
                createdOnDiv.textContent = `${task.schedule?.date || "N/A"} ${task.schedule?.time || ""}`;

                const selectDiv = document.createElement("div");
                const checkBox = document.createElement('input');
                checkBox.type = 'checkbox';
                selectDiv.appendChild(checkBox);

                row.appendChild(typeDiv);
                row.appendChild(assignToDiv);
                row.appendChild(assignedByDiv);
                row.appendChild(createdOnDiv);
                row.appendChild(selectDiv);

                if (task.schedulingId) {
                    const scheduling = task.scheduling; 
                    if (scheduling) {
                        const schedulingDateDiv = document.createElement("div");
                        schedulingDateDiv.textContent = `Date: ${scheduling.date || "N/A"}`;

                        const schedulingTimeDiv = document.createElement("div");
                        schedulingTimeDiv.textContent = `Time: ${scheduling.time || "N/A"}`;

                        row.appendChild(schedulingDateDiv);
                        row.appendChild(schedulingTimeDiv);
                    }
                }

                container.appendChild(row);
            });
        }
    } catch (err) {
        console.error("Error loading tasks: at tobins part", err);
    }
    
});

// Creates dropdown for Employees
function createEmployeeDropdown(employees, selectedId) {
    const select = document.createElement("select");
    const defaultOption = document.createElement("option");
    defaultOption.selected = !selectedId;
    defaultOption.textContent = "Choose Employee";
    select.appendChild(defaultOption);

    employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp._id;
        option.textContent = `${emp.firstName} ${emp.lastName}`;
        if (emp._id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}

function createAdminDropdown(admins, selectedId) {
    const select = document.createElement("select");
    const defaultOption = document.createElement("option");
    defaultOption.disabled = true;
    defaultOption.selected = !selectedId;
    defaultOption.textContent = "Choose Admin";
    select.appendChild(defaultOption);

    admins.forEach(admin => {
        const option = document.createElement("option");
        option.value = admin._id;
        option.textContent = `${admin.firstName} ${admin.lastName}`;
        if (admin._id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}


function taskSubmission() {
    const submitButton = document.getElementById('submit-Tasks');
    if (!submitButton) {
        console.error("Submit button not found!");
        return;
    }
    const allRows = document.querySelectorAll(".task-row");
    let tasksToSubmit = [];
    const tasksToRemove = [];

    
    allRows.forEach(row => {
        const checkBox = row.querySelector("input[type='checkbox']");
        if(checkBox && checkBox.checked) {
            const typeDiv = row.children[0];
            const assignToDiv = row.children[1];
            const assignedByDiv = row.children[2];
            const createdOnDiv = row.children[3];

            tasksToSubmit.push({
                type: typeDiv.textContent,
                assignTo: assignToDiv.querySelector("select").value,
                assignedBy: assignedByDiv.querySelector("select").value,
                createdOn: createdOnDiv.textContent
            });
            tasksToRemove.push(row);
        }
    });
        if(tasksToSubmit.length === 0) {
            alert("Please select at least one task to submit.");
            return;
        }

        submitButton.disabled = true;


       fetch('/api/assignTasks', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tasksToSubmit),
       })
        .then((response) => response.json())
        .then((data) => {
            submitButton.disabled = false;
            if (data.success) {
                alert("Tasks submitted successfully!");
                console.log("Tasks submitted successfully:", data)
                // Remove the submitted rows from the UI
                tasksToRemove.forEach(row => {
                 //   const row = document.querySelector(`.task-row:has(div:contains('${task.type}'))`);
                   // if (row) {
                     console.log("Removing row:", row);
                        row.remove();
                   // }
                });
               tasksToSubmit = [];
            }
            else {
                alert("Failed to submit tasks. Please try again.");
                console.error("Error submitting tasks:", data.message);
            }
        }
        )
        .catch((error) => {
            console.error("Error:", error);
            submitButton.disabled = false;
            alert("An error occurred. Please try again. at catch error block");
        });




}