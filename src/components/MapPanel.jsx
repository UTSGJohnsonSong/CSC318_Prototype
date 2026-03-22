import { useEffect, useMemo, useRef, useState } from "react";

function getPinTone(status) {
  if (status === "open") return "tone-fast";
  if (status === "moderate") return "tone-moderate";
  return "tone-busy";
}

export default function MapPanel({ trucks, selectedTruckId, onPinSelect }) {
  const mapRef = useRef(null);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0
  });
  const [offset, setOffset] = useState({ x: -34, y: 12 });
  const [zoom, setZoom] = useState(1.38);

  const clampZoom = (value) => Math.max(1.2, Math.min(2.05, value));

  const clampOffset = useMemo(
    () => (nextX, nextY) => {
      if (!mapRef.current) return { x: nextX, y: nextY };
      const rect = mapRef.current.getBoundingClientRect();
      const marginX = rect.width * 0.22;
      const marginY = rect.height * 0.18;
      const maxX = ((zoom - 1) * rect.width) / 2 + marginX;
      const maxY = ((zoom - 1) * rect.height) / 2 + marginY;
      return {
        x: Math.max(-maxX, Math.min(maxX, nextX)),
        y: Math.max(-maxY, Math.min(maxY, nextY))
      };
    },
    [zoom]
  );

  useEffect(() => {
    function onMove(event) {
      if (!dragStateRef.current.dragging) return;
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const next = clampOffset(
        dragStateRef.current.baseX + deltaX,
        dragStateRef.current.baseY + deltaY
      );
      setOffset(next);
    }

    function onUp() {
      dragStateRef.current.dragging = false;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [clampOffset]);

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y));
  }, [zoom, clampOffset]);

  const handlePointerDown = (event) => {
    if (event.target.closest(".map-pin")) return;
    if (event.target.closest(".map-zoom-controls")) return;
    dragStateRef.current.dragging = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    dragStateRef.current.baseX = offset.x;
    dragStateRef.current.baseY = offset.y;
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((prev) => clampZoom(prev + direction * 0.08));
  };

  return (
    <section className="map-panel" aria-label="Campus food truck map">
      <div
        className="map-canvas"
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onWheel={handleWheelZoom}
      >
        <div
          className="map-content"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
          }}
        >
          <img className="map-image" src="/UniversityofTorontoMap.png" alt="UofT campus map" />
          {trucks.map((truck) => {
            const isSelected = selectedTruckId === truck.id;
            return (
              <button
                key={truck.id}
                type="button"
                className={`map-pin ${getPinTone(truck.status)} ${isSelected ? "selected" : ""}`}
                style={{ left: `${truck.mapX}%`, top: `${truck.mapY}%` }}
                onClick={() => onPinSelect(truck.id)}
                aria-label={`${truck.name}, ${truck.waitTimeMin} minute wait`}
              >
                <span>{truck.waitTimeMin}m</span>
              </button>
            );
          })}
        </div>
        <div className="map-veil" />
        <div className="map-zoom-controls" aria-label="Map zoom controls">
          <button
            type="button"
            className="map-zoom-button"
            onClick={() => setZoom((prev) => clampZoom(prev + 0.12))}
            aria-label="Zoom in map"
          >
            +
          </button>
          <button
            type="button"
            className="map-zoom-button"
            onClick={() => setZoom((prev) => clampZoom(prev - 0.12))}
            aria-label="Zoom out map"
          >
            -
          </button>
        </div>
        <div className="map-campus-label">St. George Campus</div>
      </div>
    </section>
  );
}
