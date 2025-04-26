document.addEventListener("DOMContentLoaded", async () => {
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

                row.appendChild(typeDiv);
                row.appendChild(assignToDiv);
                row.appendChild(assignedByDiv);
                row.appendChild(createdOnDiv);

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
        console.error("Error loading tasks:", err);
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
