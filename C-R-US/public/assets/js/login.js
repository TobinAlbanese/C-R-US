console.log('login.js loaded');

let failedAttempts = 0;
let lockout = false;
const maxFailedAttempts = 15;

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (lockout) {
    return;
  }

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // Frontend validation for email and password format
  if (!email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
  if (!passwordRegex.test(password)) {
    alert("Password must contain both letters and numbers, no symbols.");
    return;
  }

  loginUser(email, password);
});

function loginUser(email, password) {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        failedAttempts = 0; // Reset failed attempts on successful login
        lockout = false; // Reset lockout status
        hideErrorMessage();
        console.log("Logged in successfully!");
        redirectToPage(data.role);
      } else {
        failedAttempts++;

        const existingErrorMessage = document.getElementById("error-message");
        if (existingErrorMessage) {
          existingErrorMessage.remove();
        }

        // Show error message
        const errorMessage = document.createElement("p");
        errorMessage.id = "error-message";
        errorMessage.style.color = "red";
        errorMessage.innerText =
          "Incorrect password or email. Please try again.";

        const passwordInput = document.getElementById("password");
        passwordInput.insertAdjacentElement("afterend", errorMessage);

        // Show forgot password and create account links after 5 failed attempts
        if (failedAttempts === 5) {
          toggleLinks(true);
        }

        if (failedAttempts >= maxFailedAttempts) {
          lockout = true;
          console.log("User locked out due to too many failed attempts.");

          // Remove the error message and show lockout message
          const lockoutMessage = document.createElement("p");
          lockoutMessage.id = "lockout-message";
          lockoutMessage.style.color = "blue";
          lockoutMessage.innerText =
            "Too many failed attempts. Please try again later.";

          const lockoutMessageExisting =
            document.getElementById("lockout-message");
          if (!lockoutMessageExisting) {
            passwordInput.insertAdjacentElement("afterend", lockoutMessage);
          }

          // Disable login button
          const loginButton = document.getElementById("loginButton");
          if (loginButton) {
            loginButton.disabled = true;
          }

          // Re-enable login after 30 minutes
          setTimeout(() => {
            lockout = false; // Re-enable login
            if (loginButton) {
              loginButton.disabled = false;
            }
            const lockoutMessage = document.getElementById("lockout-message");
            if (lockoutMessage) {
              lockoutMessage.remove();
            }
            failedAttempts = 0;
          }, 30 * 60 * 1000); // Lockout duration of 30 minutes
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
}

function hideErrorMessage() {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
    errorMessage.remove();
  }
}
function toggleLinks(show) {
  const forgotPasswordLink = document.querySelector(".special-link2");
  const createAccountLink = document.querySelector(".special-link");

  if (forgotPasswordLink) {
    forgotPasswordLink.style.display = show ? "inline-block" : "none";
  } else {
    console.warn("Forgot password link not found.");
  }

  if (createAccountLink) {
    createAccountLink.style.display = show ? "inline-block" : "none";
  } else {
    console.warn("Create account link not found.");
  }
}

function redirectToPage(role) {
  if (role === "admin") {
    window.location.href = "/admin.html";
  } else if (role === "employee") {
    window.location.href = "/employeeViewPage.html";
  } else {
    window.location.href = "/userHP.html";
  }
}
