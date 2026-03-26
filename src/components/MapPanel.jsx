import { useEffect, useMemo, useRef, useState } from "react";

function getPinTone(waitTimeMin) {
  if (waitTimeMin <= 10) return "tone-green";
  if (waitTimeMin <= 20) return "tone-yellow";
  return "tone-red";
}

function getDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getMidpoint(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };
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
  const PAN_OVERSCAN_X = 0;
  const PAN_OVERSCAN_Y = 0;
  const mapRef = useRef(null);
  const pointersRef = useRef({});
  const pinchStateRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: DEFAULT_ZOOM,
    startOffset: { x: 0, y: 0 },
    startMidpoint: { x: 0, y: 0 }
  });
  const dragStateRef = useRef({
    dragging: false,
    pointerId: null,
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
    () => (nextX, nextY, zoomValue = zoom) => {
      if (!mapRef.current) return { x: nextX, y: nextY };
      const rect = mapRef.current.getBoundingClientRect();
      const contentWidth = rect.width * (1 + mapInsetRatio * 2);
      const contentHeight = rect.height * (1 + mapInsetRatio * 2);
      const contentLeft = -mapInsetRatio * rect.width;
      const contentTop = -mapInsetRatio * rect.height;
      const extraX = (rect.width * PAN_OVERSCAN_X) / zoomValue;
      const extraY = (rect.height * PAN_OVERSCAN_Y) / zoomValue;

      // CSS applies scale before translate here, so offset bounds must be solved in screen space.
      const minX = rect.width - (contentLeft + contentWidth) * zoomValue - extraX;
      const maxX = -contentLeft * zoomValue + extraX;
      const minY = rect.height - (contentTop + contentHeight) * zoomValue - extraY;
      const maxY = -contentTop * zoomValue + extraY;

      return {
        x: Math.max(minX, Math.min(maxX, nextX)),
        y: Math.max(minY, Math.min(maxY, nextY))
      };
    },
    [mapInsetRatio, zoom]
  );

  useEffect(() => {
    function onMove(event) {
      if (pointersRef.current[event.pointerId]) {
        pointersRef.current[event.pointerId] = { x: event.clientX, y: event.clientY };
      }

      const pointers = Object.values(pointersRef.current);
      if (pinchStateRef.current.active && pointers.length >= 2) {
        if (!mapRef.current) return;
        const rect = mapRef.current.getBoundingClientRect();
        const [first, second] = pointers;
        const midpoint = getMidpoint(first, second);
        const nextDistance = getDistance(first, second);
        const nextZoom = clampZoom(
          pinchStateRef.current.startZoom * (nextDistance / pinchStateRef.current.startDistance)
        );
        const zoomRatio = nextZoom / pinchStateRef.current.startZoom;
        const currentMidpoint = {
          x: midpoint.x - rect.left,
          y: midpoint.y - rect.top
        };
        const nextOffset = clampOffset(
          currentMidpoint.x -
            zoomRatio *
              (pinchStateRef.current.startMidpoint.x - pinchStateRef.current.startOffset.x),
          currentMidpoint.y -
            zoomRatio *
              (pinchStateRef.current.startMidpoint.y - pinchStateRef.current.startOffset.y),
          nextZoom
        );
        setZoom(nextZoom);
        setOffset(nextOffset);
        return;
      }

      if (!dragStateRef.current.dragging) return;
      if (dragStateRef.current.pointerId !== null && event.pointerId !== dragStateRef.current.pointerId) {
        return;
      }
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const next = clampOffset(
        dragStateRef.current.baseX + deltaX,
        dragStateRef.current.baseY + deltaY
      );
      setOffset(next);
    }

    function onUp(event) {
      delete pointersRef.current[event.pointerId];

      if (
        mapRef.current &&
        event.pointerId !== undefined &&
        mapRef.current.hasPointerCapture?.(event.pointerId)
      ) {
        mapRef.current.releasePointerCapture(event.pointerId);
      }

      if (pinchStateRef.current.active) {
        const remainingPointers = Object.entries(pointersRef.current);
        if (remainingPointers.length >= 2) {
          const [first, second] = remainingPointers.map(([, point]) => point);
          if (!mapRef.current) return;
          const rect = mapRef.current.getBoundingClientRect();
          pinchStateRef.current = {
            active: true,
            startDistance: getDistance(first, second),
            startZoom: zoom,
            startOffset: offset,
            startMidpoint: {
              x: getMidpoint(first, second).x - rect.left,
              y: getMidpoint(first, second).y - rect.top
            }
          };
          return;
        }

        pinchStateRef.current.active = false;
        if (remainingPointers.length === 1) {
          const [[pointerId, point]] = remainingPointers;
          dragStateRef.current.dragging = true;
          dragStateRef.current.pointerId = Number(pointerId);
          dragStateRef.current.startX = point.x;
          dragStateRef.current.startY = point.y;
          dragStateRef.current.baseX = offset.x;
          dragStateRef.current.baseY = offset.y;
          return;
        }
      }

      dragStateRef.current.dragging = false;
      dragStateRef.current.pointerId = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [clampOffset, offset, zoom]);

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y));
  }, [zoom, clampOffset]);

  const handlePointerDown = (event) => {
    if (event.target.closest(".map-pin")) return;
    if (event.target.closest(".map-zoom-controls")) return;
    event.preventDefault();
    setIsRecentering(false);
    pointersRef.current[event.pointerId] = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointers = Object.values(pointersRef.current);
    if (pointers.length >= 2) {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const [first, second] = pointers;
      const midpoint = getMidpoint(first, second);
      pinchStateRef.current = {
        active: true,
        startDistance: Math.max(getDistance(first, second), 1),
        startZoom: zoom,
        startOffset: offset,
        startMidpoint: {
          x: midpoint.x - rect.left,
          y: midpoint.y - rect.top
        }
      };
      dragStateRef.current.dragging = false;
      dragStateRef.current.pointerId = null;
      return;
    }

    dragStateRef.current.dragging = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    dragStateRef.current.baseX = offset.x;
    dragStateRef.current.baseY = offset.y;
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    setIsRecentering(false);
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const focalX = event.clientX - rect.left;
    const focalY = event.clientY - rect.top;
    const direction = event.deltaY > 0 ? -1 : 1;

    setZoom((prev) => {
      const nextZoom = clampZoom(prev + direction * 0.08);
      const zoomRatio = nextZoom / prev;
      setOffset((prevOffset) =>
        clampOffset(
          focalX - zoomRatio * (focalX - prevOffset.x),
          focalY - zoomRatio * (focalY - prevOffset.y),
          nextZoom
        )
      );
      return nextZoom;
    });
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
    const next = clampOffset(targetX, targetY, zoomValue);
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
            aria-label="Myhal Centre for Engineering Innovation and Entrepreneurship"
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
                className={`map-pin ${getPinTone(truck.waitTimeMin)} ${isSelected ? "selected" : ""} ${
                  isMatch ? "" : "hidden-by-search"
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
              if (!mapRef.current) return;
              const rect = mapRef.current.getBoundingClientRect();
              const focalX = rect.width / 2;
              const focalY = rect.height / 2;
              setZoom((prev) => {
                const nextZoom = clampZoom(prev + 0.12);
                const zoomRatio = nextZoom / prev;
                setOffset((prevOffset) =>
                  clampOffset(
                    focalX - zoomRatio * (focalX - prevOffset.x),
                    focalY - zoomRatio * (focalY - prevOffset.y),
                    nextZoom
                  )
                );
                return nextZoom;
              });
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
              if (!mapRef.current) return;
              const rect = mapRef.current.getBoundingClientRect();
              const focalX = rect.width / 2;
              const focalY = rect.height / 2;
              setZoom((prev) => {
                const nextZoom = clampZoom(prev - 0.12);
                const zoomRatio = nextZoom / prev;
                setOffset((prevOffset) =>
                  clampOffset(
                    focalX - zoomRatio * (focalX - prevOffset.x),
                    focalY - zoomRatio * (focalY - prevOffset.y),
                    nextZoom
                  )
                );
                return nextZoom;
              });
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
