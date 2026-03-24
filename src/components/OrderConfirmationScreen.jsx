function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="confirmation-inline-icon">
      <path
        d="M10 17c3.2-3.8 4.8-6.4 4.8-8.5A4.8 4.8 0 0 0 5.2 8.5c0 2.1 1.6 4.7 4.8 8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="8.3" r="1.8" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="confirmation-inline-icon">
      <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 6.4v4l2.8 1.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="confirmation-check-icon">
      <circle cx="24" cy="24" r="24" fill="currentColor" />
      <path
        d="m15.5 24.5 5.6 5.8L33 18.6"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function formatPickupClock(waitTimeMin) {
  const pickup = new Date();
  pickup.setMinutes(pickup.getMinutes() + waitTimeMin);

  return pickup.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatWaitRange(waitTimeMin) {
  return `${waitTimeMin}-${waitTimeMin + 4} min`;
}

function getTruckInitials(truckName) {
  return truckName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

export default function OrderConfirmationScreen({ order, onBack, onNavigate }) {
  if (!order) return null;

  const firstItem = order.items[0];
  const pickupTime = formatPickupClock(order.truck.waitTimeMin);
  const location = order.truck.location ?? "St. George Campus, University of Toronto";
  const orderNumberFallback = `${getTruckInitials(order.truck.name) || "FT"}-00`;

  return (
    <main className="checkout-screen">
      <header className="checkout-header">
        <button type="button" className="checkout-back" onClick={onBack} aria-label="Go back">
          ‹
        </button>
        <span className="checkout-title">Order Confirmation</span>
        <span className="details-spacer" />
      </header>

      <div className="checkout-scroll">
        <section className="checkout-card confirmation-card">
          <div className="confirmation-status">
            <CheckIcon />
            <h1 className="confirmation-title">Order placed!</h1>
            <p className="confirmation-order-number">
              Order #{order.orderNumber ?? orderNumberFallback}
            </p>
            <p className="confirmation-copy">
              Your order has been received by {order.truck.name}.
            </p>
          </div>

          <div className="checkout-divider" />

          <div className="confirmation-pickup-time">Approx. {pickupTime}</div>

          <div className="confirmation-hero">
            <img
              className="confirmation-truck-image"
              src={order.truck.imageSrc}
              alt={order.truck.name}
            />
            {firstItem?.imageSrc ? (
              <img
                className="confirmation-item-image"
                src={firstItem.imageSrc}
                alt={firstItem.name}
              />
            ) : null}
          </div>

          <div className="confirmation-truck-name">{order.truck.name}</div>

          <div className="confirmation-meta">
            <div className="confirmation-meta-row">
              <PinIcon />
              <span>{location}</span>
            </div>
            <div className="confirmation-meta-row">
              <ClockIcon />
              <span>Estimated Wait: {formatWaitRange(order.truck.waitTimeMin)}</span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button type="button" className="sticky-cta" onClick={onNavigate}>
              Navigate
            </button>
            <button type="button" className="details-secondary-action">
              Share Order
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
