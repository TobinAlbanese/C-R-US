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
/*
                row.addEventListener("click", () => {
                    const previouslySelected = document.querySelector(".task-row.selected");
                    if (previouslySelected) {
                        previouslySelected.classList.remove("selected");
                    }
                    row.classList.add("selected");
                });
*/
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
/*
function submitTaskToEmployees(typeDiv, assignToDiv, assignedByDiv, createdOnDiv, row) {
    const submitButton = document.getElementById("submitButton");
    submitButton.disabled = true;
    
        const taskData = {
            type: typeDiv.textContent,
            assignTo: assignToDiv.querySelector("select").value,
            assignedBy: assignedByDiv.querySelector("select").value,
        }

        fetch(`/assignTask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        })
          .then((response) => response.json())
          .then((data) => {
            submitButton.disabled = false;
    
            if (data.success) {
                hideErrorMessage();
                row.remove(); // Remove the task row after successful submission
            } else {
              displayErrorMessage(
                data.message || "An error occurred. Please try again."
              );
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            submitButton.disabled = false;
            alert("An error occurred. Please try again.");
          });
      }

      const globalSubmitButton = document.getElementById("submitButton");

globalSubmitButton.addEventListener("click", () => {
  const selectedRow = document.querySelector(".task-row.selected");
  if (!selectedRow) {
    alert("Please select a task row first.");
    return;
  }

  const typeDiv = selectedRow.children[0];
  const assignToDiv = selectedRow.children[1];
  const assignedByDiv = selectedRow.children[2];
  const createdOnDiv = selectedRow.children[3];

  submitTaskToEmployees(typeDiv, assignToDiv, assignedByDiv, createdOnDiv, selectedRow);
});
*/
