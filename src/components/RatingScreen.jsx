import { useMemo, useState } from "react";

const WAIT_FEEDBACK_OPTIONS = [-10, -5, -3, 0, 3, 5, 10];

function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function describeWaitDelta(deltaMin) {
  if (deltaMin === 0) return "right on time";
  if (deltaMin < 0) return `${Math.abs(deltaMin)} min faster`;
  return `${deltaMin} min slower`;
}

function StarButton({ filled, onClick, label }) {
  return (
    <button
      type="button"
      className={`rating-star-button ${filled ? "filled" : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      ★
    </button>
  );
}

export default function RatingScreen({ order, onBack, onUploadWaitFeedback, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedDeltaMin, setSelectedDeltaMin] = useState(() => order?.waitTimeFeedback?.deltaMin ?? 0);
  const [waitFeedbackUploaded, setWaitFeedbackUploaded] = useState(Boolean(order?.waitTimeFeedback));

  const collectedFromLabel = useMemo(
    () => order?.truck?.name ?? "your truck",
    [order?.truck?.name]
  );
  const estimatedReadyAtMs = useMemo(() => {
    if (order?.readyAtMs) return order.readyAtMs;
    const createdAtMs = order?.createdAtMs ?? Date.now();
    const waitTimeMin = order?.truck?.waitTimeMin ?? 0;
    return createdAtMs + waitTimeMin * 60 * 1000;
  }, [order?.createdAtMs, order?.readyAtMs, order?.truck?.waitTimeMin]);
  const actualPickupAtMs = estimatedReadyAtMs + selectedDeltaMin * 60 * 1000;
  const waitFeedbackOptions = useMemo(
    () =>
      WAIT_FEEDBACK_OPTIONS.map((deltaMin) => ({
        deltaMin,
        label: `${formatClock(estimatedReadyAtMs + deltaMin * 60 * 1000)} (${describeWaitDelta(deltaMin)})`
      })),
    [estimatedReadyAtMs]
  );

  if (!order) return null;

  return (
    <main className="checkout-screen">
      <header className="checkout-header">
        <button type="button" className="checkout-back" onClick={onBack} aria-label="Go back">
          ‹
        </button>
        <span className="checkout-title">Rate Your Experience</span>
        <span className="details-spacer" />
      </header>

      <div className="checkout-scroll">
        <section className="checkout-card rating-card">
          <div className="rating-card-header">
            <h1 className="rating-title">Rate Your Experience</h1>
            <p className="rating-subtitle">Order {order.orderNumber} collected from</p>
          </div>

          <article className="rating-truck-card">
            <div className="rating-truck-images">
              <img
                className="rating-truck-thumb"
                src={order.truck.imageSrc}
                alt={order.truck.name}
              />
              {order.items[0]?.imageSrc ? (
                <img
                  className="rating-item-thumb"
                  src={order.items[0].imageSrc}
                  alt={order.items[0].name}
                />
              ) : null}
            </div>
            <div className="rating-truck-copy">
              <h2>{collectedFromLabel}</h2>
              <p>{order.truck.location ?? "University of Toronto"}</p>
            </div>
          </article>

          <div className="rating-stars-wrap">
            <div className="rating-question">How was the order?</div>
            <div className="rating-stars-row" role="radiogroup" aria-label="Rate your order">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarButton
                  key={value}
                  filled={value <= rating}
                  onClick={() => setRating(value)}
                  label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                />
              ))}
            </div>
          </div>

          <label className="rating-comment-label" htmlFor="rating-comment">
            Add comments
          </label>
          <textarea
            id="rating-comment"
            className="rating-comment-input"
            rows={4}
            placeholder="Optional quick feedback about wait time or pickup."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />

          <section className="rating-wait-card" aria-label="Wait time feedback">
            <div className="rating-wait-card-header">
              <strong>Wait Time Feedback</strong>
              <span>Estimated ready time: {formatClock(estimatedReadyAtMs)}</span>
            </div>

            <label className="rating-comment-label" htmlFor="actual-pickup-time">
              Your actual pickup time was:
            </label>
            <select
              id="actual-pickup-time"
              className="rating-wait-select"
              value={selectedDeltaMin}
              onChange={(event) => {
                setSelectedDeltaMin(Number(event.target.value));
                setWaitFeedbackUploaded(false);
              }}
            >
              {waitFeedbackOptions.map((option) => (
                <option key={option.deltaMin} value={option.deltaMin}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className="rating-wait-helper">
              Your actual pickup time was {formatClock(actualPickupAtMs)}, which is{" "}
              {describeWaitDelta(selectedDeltaMin)} than the estimate.
            </p>
            <p className="rating-wait-helper">Upload this as a reference wait time?</p>

            <div className="rating-wait-actions">
              <button
                type="button"
                className="rating-wait-confirm"
                onClick={() => {
                  onUploadWaitFeedback?.({
                    truckId: order.truck.id,
                    deltaMin: selectedDeltaMin,
                    actualPickupAtMs
                  });
                  setWaitFeedbackUploaded(true);
                }}
              >
                Confirm
              </button>
              {waitFeedbackUploaded ? (
                <span className="rating-wait-success">Uploaded successfully.</span>
              ) : null}
            </div>
          </section>

          <button
            type="button"
            className="sticky-cta"
            onClick={() => onSubmit({ rating, comment })}
          >
            Submit
          </button>
        </section>
      </div>
    </main>
  );
}
