console.log("userCreateAccount.js is running!");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userCreateAccount");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Form submission prevented");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    console.log("Form found:", form);

    // Frontend validation for email and password format
    console.log("Password before validation:", password);
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain both letters and numbers, no symbols, and be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Proceed to create user account
    console.log("Email:", email);
    console.log("Password:", password);

    createUserAccount(email, password, confirmPassword); // Pass confirmPassword as well
  });

  function createUserAccount(email, password, confirmPassword) {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    // Debugging: Log the values of the fields
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    fetch(`/userCreateAccount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword }), // Include confirmPassword in the request
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data received from server:", data);
        submitButton.disabled = false;

        if (data.success) {
          hideErrorMessage();
          redirectToPage();
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

  function hideErrorMessage() {
    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  function displayErrorMessage(message) {
    const existingErrorMessage = document.getElementById("error-message");
    if (existingErrorMessage) {
      existingErrorMessage.remove();
    }

    const errorMessage = document.createElement("p");
    errorMessage.id = "error-message";
    errorMessage.style.color = "red";
    errorMessage.innerText = message;

    const passwordInput = document.getElementById("password");
    passwordInput.insertAdjacentElement("afterend", errorMessage);
  }

  function redirectToPage() {
    console.log("Redirecting to login page...");
    window.location.replace("/login.html"); // Redirect to login page after successful account creation
  }
});
