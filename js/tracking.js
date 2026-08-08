const trackingForm = document.getElementById("trackingForm");

const trackingResult =
  document.getElementById("trackingResult");

const trackingError =
  document.getElementById("trackingError");

const orderIdInput =
  document.getElementById("orderId");

const displayOrderId =
  document.getElementById("displayOrderId");

const displayDate =
  document.getElementById("displayDate");

const displayDelivery =
  document.getElementById("displayDelivery");

const orderItems =
  document.getElementById("orderItems");


const statusOrder = [
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered"
];


function formatStatus(status) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}


function formatDate(date) {
  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}


function showError(message) {
  trackingError.textContent = message;
  trackingError.style.display = "block";
  trackingResult.style.display = "none";
}


function showTracking(order) {

  trackingError.style.display = "none";
  trackingResult.style.display = "block";

  displayOrderId.textContent = order.order_id;

  displayDate.textContent =
    formatDate(order.created_at);

  displayDelivery.textContent =
    order.delivery_method || "Not specified";


  const currentIndex =
    statusOrder.indexOf(order.status);


  document
    .querySelectorAll(".tracking-step")
    .forEach(step => {

      const stepStatus =
        step.dataset.status;

      const stepIndex =
        statusOrder.indexOf(stepStatus);

      step.classList.remove(
        "completed",
        "current"
      );

      if (stepIndex <= currentIndex) {
        step.classList.add("completed");
      }

      if (stepStatus === order.status) {
        step.classList.add("current");
      }
    });


  orderItems.innerHTML = "";


  if (
    Array.isArray(order.items) &&
    order.items.length
  ) {

    order.items.forEach(item => {

      const row =
        document.createElement("div");

      row.className = "order-item";

      const name =
        item.name ||
        item.title ||
        "GEMI WEARS item";

      const quantity =
        item.quantity ||
        1;

      row.innerHTML = `
        <span>${name}</span>
        <span>× ${quantity}</span>
      `;

      orderItems.appendChild(row);
    });

  } else {

    orderItems.innerHTML =
      "<p>Order items unavailable.</p>";

  }
}


trackingForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const orderId =
      orderIdInput.value
        .trim()
        .toUpperCase();

    if (!orderId) {
      showError("Please enter your order number.");
      return;
    }

    try {

      const response =
        await fetch(
          `/api/track-order?orderId=${encodeURIComponent(orderId)}`
        );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        showError(
          result.message ||
          "Order not found."
        );

        return;
      }

      showTracking(result.data);

    } catch (error) {

      console.error(error);

      showError(
        "Unable to track your order right now. Please try again."
      );

    }
  }
);
