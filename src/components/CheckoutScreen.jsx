import { useState } from "react";

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="checkout-chevron-icon">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="checkout-method-check">
      <path
        d="m5.5 10.4 2.8 2.8 6.2-6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function formatPickupTime(waitTimeMin) {
  const pickup = new Date();
  pickup.setMinutes(pickup.getMinutes() + waitTimeMin);

  const time = pickup.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  return `${waitTimeMin} minutes (${time})`;
}

export default function CheckoutScreen({
  truck,
  items,
  subtotal,
  taxFees,
  total,
  paymentMethods,
  paymentMethod,
  onPaymentMethodChange,
  pickupName,
  onPickupNameChange,
  onBack,
  onConfirm
}) {
  const [paymentPickerOpen, setPaymentPickerOpen] = useState(false);

  const handleSelectPaymentMethod = (methodId) => {
    onPaymentMethodChange?.(methodId);
    setPaymentPickerOpen(false);
  };

  return (
    <main className="checkout-screen">
      <header className="checkout-header">
        <button type="button" className="checkout-back" onClick={onBack} aria-label="Go back">
          ‹
        </button>
        <span className="checkout-title">Checkout</span>
        <span className="details-spacer" />
      </header>

      <div className="checkout-scroll">
        <section className="checkout-card">
          <div className="checkout-items-list">
            {items.map((item) => (
              <article key={item.key} className="checkout-item">
                <div className="checkout-item-thumb">
                  <img src={item.imageSrc} alt={item.name} />
                </div>
                <div className="checkout-item-copy">
                  <div className="checkout-item-head">
                    <h2 className="checkout-item-name">{item.name}</h2>
                    <span className="checkout-item-total">
                      CAD ${(item.priceCad * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="checkout-item-description">{item.description}</p>
                  <div className="checkout-item-meta">
                    <span>Qty {item.quantity}</span>
                    <span>C${item.priceCad.toFixed(2)} each</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-divider" />

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>CAD ${subtotal.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Tax & Fees</span>
            <span>CAD ${taxFees.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row total">
            <span>Total</span>
            <span>CAD ${total.toFixed(2)}</span>
          </div>
        </section>

        <section className="checkout-card checkout-form-card">
          <label className="checkout-field-label" htmlFor="pickup-name">
            Name for Pickup
          </label>
          <input
            id="pickup-name"
            className="checkout-input"
            type="text"
            placeholder="Enter your name"
            value={pickupName}
            onChange={(event) => onPickupNameChange(event.target.value)}
          />
        </section>

        <section className="checkout-card checkout-info-card">
          <div className="checkout-info-header">
            <span className="checkout-field-label">Payment Details</span>
            <button
              type="button"
              className="checkout-link-button"
              onClick={() => setPaymentPickerOpen(true)}
            >
              Change
            </button>
          </div>
          <div className="checkout-info-row">
            <button
              type="button"
              className="checkout-selected-method"
              onClick={() => setPaymentPickerOpen(true)}
              aria-label="Change payment method"
            >
              <span className="checkout-payment-copy">
                <span className="checkout-card-badge" aria-hidden="true">
                  {paymentMethod?.badge ?? "CARD"}
                </span>
                <span className="checkout-method-summary">{paymentMethod?.summary ?? "•••• 1234"}</span>
              </span>
              <ChevronRightIcon />
            </button>
          </div>

          <div className="checkout-divider" />

          <div className="checkout-summary-row">
            <span className="checkout-field-label no-transform">Pickup Time</span>
            <span>{formatPickupTime(truck.waitTimeMin)}</span>
          </div>
          <p className="checkout-helper-copy">Orders are pick up at the truck.</p>
        </section>
      </div>

      <footer className="checkout-footer">
        <button
          type="button"
          className="sticky-cta"
          disabled={!items.length}
          onClick={onConfirm}
        >
          Confirm Order
        </button>
        <div className="checkout-total-footer">Total: CAD ${total.toFixed(2)}</div>
      </footer>

      {paymentPickerOpen ? (
        <>
          <button
            type="button"
            className="checkout-sheet-backdrop"
            onClick={() => setPaymentPickerOpen(false)}
            aria-label="Close payment methods"
          />
          <section className="checkout-method-sheet" aria-label="Select payment method">
            <div className="checkout-method-sheet-handle" />
            <div className="checkout-method-sheet-header">
              <strong>Payment Method</strong>
            </div>
            <div className="checkout-method-list" role="radiogroup" aria-label="Checkout payment method">
              {(paymentMethods ?? []).map((method) => {
                const selected = method.id === paymentMethod?.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`checkout-method-option ${selected ? "selected" : ""}`}
                    onClick={() => handleSelectPaymentMethod(method.id)}
                    role="radio"
                    aria-checked={selected}
                  >
                    <span className="checkout-payment-copy">
                      <span className="checkout-card-badge" aria-hidden="true">
                        {method.badge}
                      </span>
                      <span className="checkout-method-copy">
                        <span className="checkout-method-summary">{method.summary}</span>
                        <span className="checkout-method-detail">{method.detail}</span>
                      </span>
                    </span>
                    <span className="checkout-method-indicator" aria-hidden="true">
                      {selected ? <CheckIcon /> : <ChevronRightIcon />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
