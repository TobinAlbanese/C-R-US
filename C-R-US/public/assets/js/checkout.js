document.addEventListener('DOMContentLoaded', () => {
  const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    email: document.getElementById("email"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    state: document.getElementById("state"),
    zip: document.getElementById("zip"),
    cardName: document.getElementById("cardName"),
    cardNumber: document.getElementById("cardNumber"),
    expDate: document.getElementById("expDate"),
    cvv: document.getElementById("cvv"),
    submitButton: document.getElementById("submit-button"),
    orderSection: document.getElementById('order')
  };

  const appointmentData = JSON.parse(localStorage.getItem('appointmentData')) || {};
  console.log("Loaded appointment data:", appointmentData);

  if (!appointmentData?.date) {
    alert("Please complete your appointment first.");
    window.location.href = '/appointment.html';
    return;
  }

  function displayOrderSummary() {
    const { date, time, service, price } = appointmentData;

    fields.orderSection.innerHTML = `
      <div class="order-summary">
        <div class="left-column">
          <div class="order-line"><span class="label">Appointment Date:</span> <span class="value">${date || 'N/A'}</span></div>
          <div class="order-line"><span class="label">Appointment Time:</span> <span class="value">${time || 'N/A'}</span></div>
        </div>
        <div class="right-column">
          <div class="order-line"><span class="label">Service:</span> <span class="value">${service || 'N/A'}</span></div>
          <div class="order-line"><span class="label">Price:</span> <span class="value">$${price || '0.00'}</span></div>
        </div>
      </div>
    `;
  }

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true, errorMessage = '';

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
        isValid = /^\d{16}$/.test(value.replace(/\s/g, ''));
        errorMessage = 'Must be 16 digits';
        break;
      case 'expDate':
        isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value);
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
    if (errorElement?.classList.contains('error-message')) {
      errorElement.textContent = isValid ? '' : errorMessage;
    }

    return isValid;
  }

  function validateForm() {
    return Object.values(fields).slice(0, 11).every(validateField);
  }



  async function confirmAppointment(appointmentData) {
    try {
      console.log("Sending appointment data to server...");

      const confirmRes = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(appointmentData)
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        console.error("Response error:", confirmData);
        throw new Error(confirmData.error || "Appointment confirmation failed");
      }

      console.log("Appointment confirmed:", confirmData);
      return true;
    } catch (err) {
      console.error("Appointment confirmation error:", err);
      alert("Could not confirm appointment.");
      return false;
    }
  }

  async function processCheckout(checkoutData, appointmentData) {
    try {
      if (!checkoutData || !checkoutData.shipInfo || !checkoutData.payInfo) {
        console.error("Invalid checkout data", checkoutData);
        throw new Error("Missing required checkout data");
      }
  
      console.log("Sending checkout data to server...");
  
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          checkoutData: checkoutData, 
          appointmentData: appointmentData 
        })
      });
  
      const checkoutDataResponse = await checkoutRes.json();
      if (!checkoutRes.ok) {
        console.error("Response error:", checkoutDataResponse);
        throw new Error(checkoutDataResponse.error || "Checkout processing failed");
      }
  
      console.log("Checkout processed:", checkoutDataResponse);
      return true;
    } catch (err) {
      console.error("Checkout processing error:", err);
      alert("Could not process checkout.");
      return false;
    }
  }
  
  

  fields.submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please correct the errors in the form');
      return;
    }

    fields.submitButton.disabled = true;
    fields.submitButton.textContent = 'Processing...';

    try {
      const checkoutData = {
        shipInfo: {
          firstName: fields.firstName.value.trim(),
          lastName: fields.lastName.value.trim(),
          email: fields.email.value.trim(),
          address: fields.address.value.trim(),
          city: fields.city.value.trim(),
          state: fields.state.value.trim(),
          zip: fields.zip.value.trim()
        },
        payInfo: {
          cardName: fields.cardName.value.trim(),
          cardNumber: fields.cardNumber.value.replace(/\s/g, ''),
          expDate: fields.expDate.value.trim(),
          cvv: fields.cvv.value.trim()
        },
        appDate: `${appointmentData.date} ${appointmentData.time}`,
        service: appointmentData.service,
        price: appointmentData.price,
        status: "pending", // initially pending until confirmed
        appointmentId: appointmentData.appointmentId
      };

      console.log("Checkout data:", checkoutData);

      // First, send appointment data to /appointment endpoint
      const appointmentConfirmed = await confirmAppointment(appointmentData);
      if (!appointmentConfirmed) {
        throw new Error("Failed to confirm appointment.");
      }

      // Then, send checkout data to /checkout endpoint
      const checkoutConfirmed = await processCheckout(checkoutData);

      if (checkoutConfirmed) {
        window.location.href = "/paymentConfirmation.html";
      }

    } catch (error) {
      console.error("Checkout failed:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      fields.submitButton.disabled = false;
      fields.submitButton.textContent = 'Complete Purchase';
    }
  });
  displayOrderSummary();
});
