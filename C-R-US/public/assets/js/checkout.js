document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const form = document.querySelector('form');
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const address = document.getElementById("address");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const zip = document.getElementById("zip");
  const cardName = document.getElementById("cardName");
  const cardNumber = document.getElementById("cardNumber");
  const expDate = document.getElementById("expDate");
  const cvv = document.getElementById("cvv");
  const submitButton = document.getElementById("submit-button");
  const orderSection = document.getElementById('order');

  const appointmentData = JSON.parse(localStorage.getItem('appointmentData')) || {};
  console.log("Loaded appointment data:", appointmentData);

  if (!appointmentData || !appointmentData.date) {
    alert("Please complete your appointment first.");
    window.location.href = '/appointment.html';
    return;
  }

  function displayOrderSummary() {
    const appointmentDate = appointmentData.date || 'Not specified';
    const appointmentTime = appointmentData.time || 'Not specified';
    const appointmentService = appointmentData.service || 'Not specified';
    const appointmentPrice = appointmentData.price ? `$${appointmentData.price}` : '$0.00';

    orderSection.innerHTML = `
      <div class="order-summary">
        <div class="left-column">
          <div class="order-line"><span class="label">Appointment Date:</span> <span class="value">${appointmentDate}</span></div>
          <div class="order-line"><span class="label">Appointment Time:</span> <span class="value">${appointmentTime}</span></div>
        </div>
        <div class="right-column">
          <div class="order-line"><span class="label">Service:</span> <span class="value">${appointmentService}</span></div>
          <div class="order-line"><span class="label">Price:</span> <span class="value">${appointmentPrice}</span></div>
        </div>
      </div>
    `;
  }

  displayOrderSummary();

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.id) {
      case 'firstName':
      case 'lastName':
      case 'cardName':
        isValid = value.length >= 2;
        errorMessage = 'Must be at least 2 characters';
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        errorMessage = 'Invalid email format';
        break;
      case 'cardNumber':
        const cardNum = value.replace(/\s/g, '');
        isValid = /^\d{16}$/.test(cardNum);
        errorMessage = 'Must be 16 digits';
        break;
      case 'expDate':
        isValid = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value);
        errorMessage = 'Use MM/YY format';
        break;
      case 'cvv':
        isValid = /^\d{3,4}$/.test(value);
        errorMessage = 'Must be 3-4 digits';
        break;
      default:
        isValid = value.length > 0;
        errorMessage = 'This field is required';
    }

    field.style.borderColor = isValid ? '' : '#ff4444';
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
      errorElement.textContent = isValid ? '' : errorMessage;
    }

    return isValid;
  }

  function validateForm() {
    let isFormValid = true;
    [firstName, lastName, email, address, city, state, zip, cardName, cardNumber, expDate, cvv].forEach(field => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });
    return isFormValid;
  }

  submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      alert('Please correct the errors in the form');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
      const checkoutData = {
        shipInfo: {
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          email: email.value.trim(),
          address: address.value.trim(),
          city: city.value.trim(),
          state: state.value.trim(),
          zip: zip.value.trim()
        },
        payInfo: {
          cardName: cardName.value.trim(),
          cardNumber: cardNumber.value.replace(/\s/g, ''),
          expDate: expDate.value.trim(),
          cvv: cvv.value.trim()
        },
        appDate: `${appointmentData.date} at ${appointmentData.time}`,
        service: appointmentData.service,
        price: appointmentData.price
      };

      checkoutData.appointmentId = appointmentData._id;
      checkoutData.status = "confirmed";
      console.log("appDate is:", appointmentData.date);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Checkout failed');
      }

      window.location.href = "/paymentConfirmation.html";
      
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Complete Purchase';
    }
  });
});