function getStatusTone(status) {
  if (status === "open") return "badge-fast";
  if (status === "moderate") return "badge-moderate";
  return "badge-busy";
}

function highlightMatch(text, query) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const matched = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <>
      {before}
      <mark className="search-highlight-mark">{matched}</mark>
      {after}
    </>
  );
}

export default function TruckCard({ truck, selected, onSelect, query = "" }) {
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
            <div className="truck-name">{highlightMatch(truck.name, query)}</div>
            <div className="truck-cuisine">{highlightMatch(truck.cuisine, query)}</div>
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
