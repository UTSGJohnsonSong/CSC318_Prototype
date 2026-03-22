export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  compact = false
}) {
  return (
    <div className={`quantity-control ${compact ? "compact" : ""}`}>
      <button
        type="button"
        className="quantity-button"
        onClick={onDecrease}
        disabled={quantity === 0}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="quantity-value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className="quantity-button primary"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
