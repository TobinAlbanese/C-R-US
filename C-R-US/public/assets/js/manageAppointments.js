document.addEventListener("DOMContentLoaded", async () => {
     
    const createButton = document.getElementById('create');
    const deleteButton = document.getElementById('delete-Tasks');


    if(createButton) {
        createButton.addEventListener("click", (e_) => {
            e_.preventDefault();
            createAppointment();
        });
    }else {
        alert("FAILED to submit button");
    }

    if(deleteButton) {
        deleteButton.addEventListener("click", (e_) => {
            e_.preventDefault();
            deleteAppointment();
        });
    }else {
        alert("FAILED to submit button");
    }
    
    
    try {
        const res = await fetch("/api/manage-appointments");
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

            const assignToWrapper = document.getElementById("assignToWrapper");
            const assignedByWrapper = document.getElementById("assignedByWrapper");

            const employeeDropdown = createEmployeeDropdown(employees);
            employeeDropdown.id = "assignTo";
            assignToWrapper.innerHTML = ""; // Clear previous content
            assignToWrapper.appendChild(employeeDropdown);

            const adminDropdown = createAdminDropdown(admins);
            adminDropdown.id = "assignBy";
            assignByWrapper.innerHTML = ""; // Clear previous content
            assignByWrapper.appendChild(adminDropdown);

            data.tasks.forEach((task) => {
                console.log("Task:", task);

                const row = document.createElement("div");
                row.className = "task-row"; 

                const typeDiv = document.createElement("div");
                typeDiv.textContent = task.type || "N/A";

                const patientDiv = document.createElement("div");
                patientDiv.textContent = `${task.shipInfo ? `${task.shipInfo.firstName} ${task.shipInfo.lastName}` : "N/A"}`;


                const assignedToDiv = document.createElement("div");
                assignedToDiv.textContent = task.assignedUserName || "N/A";

                const assignedByDiv = document.createElement("div");
                assignedByDiv.textContent = task.assignedBy || "N/A";

                const createdOnDiv = document.createElement("div");
                createdOnDiv.textContent = `${task.schedule?.date || "N/A"} ${task.schedule?.time || ""}`;

                const selectDiv = document.createElement("div");
                const checkBox = document.createElement('input');
                checkBox.type = 'checkbox';
                checkBox.setAttribute("data-task-id", task._id);
                selectDiv.appendChild(checkBox);

            
                row.appendChild(patientDiv);
                row.appendChild(typeDiv);
                row.appendChild(assignedToDiv);
                row.appendChild(assignedByDiv);
                row.appendChild(createdOnDiv);
                row.appendChild(selectDiv);

        
                

                container.appendChild(row);
            });
            
    }
    } catch (err) {
        console.error("Error loading tasks: at tobins part", err);
    }
});






function openForm() {
    document.getElementById("create-Appointment-Form").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("create-Appointment-Form").style.display = "none";
  }

  


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

async function createAppointment() {
    const assignTo = document.getElementById("assignTo").value;
    const assignBy = document.getElementById("assignBy").value;
    const type = document.getElementById("type").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;


    const appointmentData = {
        user: assignTo,
        admin: assignBy,
        date,
        time,
        service: type,
        comments: ""
        
    }

    try {
        const res = await fetch("/api/assign-tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
            });

        const result = await res.json();
        if (result.success) {
            alert("Task created successfully!");
            closeForm();
            window.location.reload(); 
        } else {
            alert("Failed to create task: " + result.message);
        }
    } catch (error) {
        console.error("Error creating task:", error);
        alert("An error occurred while creating the task.");
    }

}

async function deleteAppointment() {
    const selectedTasks = document.querySelectorAll(".task-row input[type='checkbox']:checked");
    if (selectedTasks.length === 0) {
        alert("Please select at least one task to delete.");
        return;
    }
    const taskIds = Array.from(selectedTasks).map(checkbox =>
        checkbox.getAttribute("data-task-id")
    );

    try {
        const res = await fetch("/api/delete-task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ taskIds })
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

  document.getElementById("create-Appointment-Button").addEventListener("click", openForm);