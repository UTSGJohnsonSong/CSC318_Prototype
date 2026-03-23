import { useEffect, useMemo, useRef, useState } from "react";

function getPinTone(status) {
  if (status === "open") return "tone-fast";
  if (status === "moderate") return "tone-moderate";
  return "tone-busy";
}

export default function MapPanel({
  trucks,
  selectedTruckId,
  onPinSelect,
  recenterSignal,
  matchedTruckIds = [],
  queryActive = false
}) {
  const DEFAULT_ZOOM = 2.1;
  const CENTER_ANCHOR_X = 0.42;
  const CENTER_ANCHOR_Y = 0.24;
  const mapInsetRatio = 0.08;
  const PAN_OVERSCAN_X = 0.7;
  const PAN_OVERSCAN_Y = 0.9;
  const mapRef = useRef(null);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isRecentering, setIsRecentering] = useState(false);
  const recenterTimerRef = useRef(null);
  const userLocation = { x: 62, y: 62 };
  const matchedSet = useMemo(() => new Set(matchedTruckIds), [matchedTruckIds]);

  const clampZoom = (value) => Math.max(1.15, Math.min(3.2, value));

  const clampOffset = useMemo(
    () => (nextX, nextY) => {
      if (!mapRef.current) return { x: nextX, y: nextY };
      const rect = mapRef.current.getBoundingClientRect();
      const contentWidth = rect.width * (1 + mapInsetRatio * 2);
      const contentHeight = rect.height * (1 + mapInsetRatio * 2);
      const contentLeft = -mapInsetRatio * rect.width;
      const contentTop = -mapInsetRatio * rect.height;
      const extraX = (rect.width * PAN_OVERSCAN_X) / zoom;
      const extraY = (rect.height * PAN_OVERSCAN_Y) / zoom;

      // transform order is translate(...) scale(...), so solve clamp bounds in pre-scale coords.
      // Keep viewport always covered by content while allowing panning across full map extent.
      const minX = rect.width / zoom - contentLeft - contentWidth - extraX;
      const maxX = -contentLeft + extraX;
      const minY = rect.height / zoom - contentTop - contentHeight - extraY;
      const maxY = -contentTop + extraY;

      return {
        x: Math.max(minX, Math.min(maxX, nextX)),
        y: Math.max(minY, Math.min(maxY, nextY))
      };
    },
    [mapInsetRatio, zoom]
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
    setIsRecentering(false);
    dragStateRef.current.dragging = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    dragStateRef.current.baseX = offset.x;
    dragStateRef.current.baseY = offset.y;
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    setIsRecentering(false);
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((prev) => clampZoom(prev + direction * 0.08));
  };

  const centerOnPoint = (xPercent, yPercent, zoomValue = zoom) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const contentWidth = rect.width * (1 + mapInsetRatio * 2);
    const contentHeight = rect.height * (1 + mapInsetRatio * 2);
    const contentLeft = -mapInsetRatio * rect.width;
    const contentTop = -mapInsetRatio * rect.height;
    const baseX = contentLeft + (xPercent / 100) * contentWidth;
    const baseY = contentTop + (yPercent / 100) * contentHeight;
    const targetX = rect.width * CENTER_ANCHOR_X - zoomValue * baseX;
    const targetY = rect.height * CENTER_ANCHOR_Y - zoomValue * baseY;
    const next = clampOffset(targetX, targetY);
    setOffset(next);
  };

  const centerOnUser = (zoomValue = zoom) => {
    centerOnPoint(userLocation.x, userLocation.y, zoomValue);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsRecentering(true);
      setZoom(DEFAULT_ZOOM);
      centerOnUser(DEFAULT_ZOOM);
      if (recenterTimerRef.current) clearTimeout(recenterTimerRef.current);
      recenterTimerRef.current = setTimeout(() => {
        setIsRecentering(false);
      }, 540);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (recenterTimerRef.current) clearTimeout(recenterTimerRef.current);
    };
  }, [recenterSignal]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setZoom(DEFAULT_ZOOM);
      centerOnUser(DEFAULT_ZOOM);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!queryActive) return;
    const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId);
    if (!selectedTruck) return;
    const raf = requestAnimationFrame(() => {
      centerOnPoint(selectedTruck.mapX, selectedTruck.mapY, DEFAULT_ZOOM);
    });
    return () => cancelAnimationFrame(raf);
  }, [queryActive, selectedTruckId, trucks]);

  return (
    <section className="map-panel" aria-label="Campus food truck map">
      <div
        className="map-canvas"
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onWheel={handleWheelZoom}
      >
        <div
          className={`map-content ${isRecentering ? "recentering" : ""}`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
          }}
        >
          <img className="map-image" src="/UniversityofTorontoMap.png" alt="UofT campus map" />
          <div
            className="user-location"
            style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
            aria-label="Your current location"
          >
            <span className="user-halo" />
            <span className="user-dot" />
          </div>
          {trucks.map((truck) => {
            const isSelected = selectedTruckId === truck.id;
            const isMatch = !queryActive || matchedSet.has(truck.id);
            return (
              <button
                key={truck.id}
                type="button"
                className={`map-pin ${getPinTone(truck.status)} ${isSelected ? "selected" : ""} ${
                  isMatch ? "" : "dimmed"
                }`}
                style={{ left: `${truck.mapX}%`, top: `${truck.mapY}%` }}
                onClick={() => onPinSelect(truck.id)}
                aria-label={`${truck.name}, ${truck.waitTimeMin} minute wait`}
                disabled={!isMatch}
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
            onClick={() => {
              setIsRecentering(false);
              setZoom((prev) => clampZoom(prev + 0.12));
            }}
            aria-label="Zoom in map"
          >
            +
          </button>
          <button
            type="button"
            className="map-zoom-button"
            onClick={() => {
              setIsRecentering(false);
              setZoom((prev) => clampZoom(prev - 0.12));
            }}
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
