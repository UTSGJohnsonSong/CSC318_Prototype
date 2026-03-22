import QuantityControl from "./QuantityControl";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cart-trash-icon">
      <path
        d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v7h-2v-7Zm4 0h2v7h-2v-7ZM7 10h2v7H7v-7Zm-1 10h12l1-12H5l1 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function CartScreen({
  items,
  total,
  itemCount,
  onClose,
  onCheckout,
  onIncrease,
  onDecrease,
  onRemove
}) {
  return (
    <div className="cart-overlay" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        type="button"
        className="cart-backdrop"
        aria-label="Close cart"
        onClick={onClose}
      />

      <section className="cart-sheet">
        <header className="cart-sheet-header">
          <h2 className="cart-sheet-title">Your Cart</h2>
          <button type="button" className="cart-close-button" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </header>

        {items.length ? (
          <div className="cart-sheet-list">
            {items.map((item) => (
              <article key={item.key} className="cart-sheet-item">
                <div className="details-menu-thumb cart-sheet-thumb">
                  <img src={item.imageSrc} alt={item.name} />
                </div>
                <div className="cart-sheet-copy">
                  <div className="cart-sheet-row">
                    <div>
                      <h3 className="cart-sheet-item-name">{item.name}</h3>
                      <p className="cart-sheet-item-description">{item.description}</p>
                    </div>
                    <div className="cart-sheet-item-price">
                      C${(item.priceCad * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="details-menu-subprice">C${item.priceCad.toFixed(2)} each</div>
                    <div className="cart-item-actions">
                      <QuantityControl
                        quantity={item.quantity}
                        onIncrease={() => onIncrease(item.truckId, item.itemId)}
                        onDecrease={() => onDecrease(item.truckId, item.itemId)}
                        compact
                      />
                      <button
                        type="button"
                        className="cart-trash-button"
                        onClick={() => onRemove(item.truckId, item.itemId)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="cart-empty-copy">Your cart is empty.</p>
        )}

        <div className="cart-subtotal-row">
          <span className="cart-total-label">Subtotal</span>
          <strong className="cart-subtotal-value">CAD ${total.toFixed(2)}</strong>
        </div>

        <div className="cart-sheet-actions">
          <button
            type="button"
            className="sticky-cta"
            onClick={onCheckout}
            disabled={!items.length}
          >
            Checkout{itemCount ? ` (${itemCount})` : ""}
          </button>
          <button type="button" className="details-secondary-action" onClick={onClose}>
            Keep browsing
          </button>
        </div>
      </section>
    </div>
  );
}
