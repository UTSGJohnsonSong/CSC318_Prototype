function getStatusTone(status) {
  if (status === "open") return "badge-fast";
  if (status === "moderate") return "badge-moderate";
  return "badge-busy";
}

export default function TruckCard({ truck, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`truck-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(truck.id)}
      aria-pressed={selected}
    >
      <div className="truck-thumb">
        {truck.imageSrc ? (
          <img className="truck-thumb-image" src={truck.imageSrc} alt={truck.name} />
        ) : (
          truck.image
        )}
      </div>
      <div className="truck-content">
        <div className="truck-main-row">
          <div>
            <div className="truck-name">{truck.name}</div>
            <div className="truck-cuisine">{truck.cuisine}</div>
          </div>
          <div className="wait-time">
            <span className="wait-value">{truck.waitTimeMin} min</span>
            <span className="wait-label">Est. wait</span>
          </div>
        </div>
        <div className="truck-metrics">
          <span className="walk-pill">{truck.walkTimeMin} min walk</span>
          <span>
            {truck.rating.toFixed(1)} ({truck.reviewCount})
          </span>
        </div>
        <div className="truck-bottom-row">
          <span className={`status-badge ${getStatusTone(truck.status)}`}>{truck.badge}</span>
          <span className="trust-note">{truck.trustNote}</span>
        </div>
      </div>
    </button>
  );
}
