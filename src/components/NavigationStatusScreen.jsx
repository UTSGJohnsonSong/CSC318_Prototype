import { useEffect, useMemo, useRef, useState } from "react";

const MYHAL_LABEL = "Myhal Centre for Engineering Innovation and Entrepreneurship";
const MYHAL_ADDRESS =
  "Myhal Centre for Engineering Innovation and Entrepreneurship, 55 St George St, Toronto, ON M5S 0C9";

function getDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getMidpoint(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };
}

function getTruckInitials(truckName) {
  return truckName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export default function NavigationStatusScreen({ order, onBack, onCollected }) {
  if (!order) return null;

  const DEFAULT_ZOOM = 2.1;
  const CENTER_ANCHOR_X = 0.42;
  const CENTER_ANCHOR_Y = 0.24;
  const MAP_INSET_RATIO = 0.08;
  const PAN_OVERSCAN_X = 0;
  const PAN_OVERSCAN_Y = 0;
  const userLocation = { x: 62, y: 62 };
  const mapCanvasRef = useRef(null);
  const hasCenteredMapRef = useRef(false);
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
  const sheetDragRef = useRef({
    dragging: false,
    startY: 0,
    startOffset: 0
  });
  const sheetRef = useRef(null);
  const [sheetHiddenOffset, setSheetHiddenOffset] = useState(0);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [nowMs, setNowMs] = useState(Date.now());
  const [mapDragging, setMapDragging] = useState(false);
  const [sheetOffset, setSheetOffset] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);

  const clampZoom = (value) => Math.max(1.15, Math.min(3.2, value));
  const travelMin = Math.max(1, order.truck.walkTimeMin ?? 3);
  const distanceMeters = Math.max(120, travelMin * 80);
  const destination = useMemo(
    () => ({
      x: order.truck.mapX ?? 64,
      y: order.truck.mapY ?? 34
    }),
    [order.truck.mapX, order.truck.mapY]
  );
  const initialWaitMin = Math.max(1, order.truck.waitTimeMin ?? 1);
  const createdAtMs = order.createdAtMs ?? Date.now();
  const readyAtMs = order.readyAtMs ?? createdAtMs + initialWaitMin * 60 * 1000;
  const elapsedMin = Math.max(0, Math.floor((nowMs - createdAtMs) / 60000));
  const remainingFoodMin = Math.max(0, initialWaitMin - elapsedMin);
  const foodReadyLabel =
    remainingFoodMin > 0 ? `Food ready in ~${remainingFoodMin} min` : "Food ready now";
  const timelineReady = remainingFoodMin <= 0;
  const timelineCollected = Boolean(order.collectedAtMs);
  const displayOrderNumber = useMemo(() => {
    if (order.orderNumber) return order.orderNumber;
    return `${getTruckInitials(order.truck.name) || "FT"}-00`;
  }, [order.orderNumber, order.truck.name]);
  const SHEET_HIDDEN_EXTRA = 14;
  const clampOffset = useMemo(
    () => (nextX, nextY, zoomValue = mapZoom) => {
      if (!mapCanvasRef.current) return { x: nextX, y: nextY };
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const contentWidth = rect.width * (1 + MAP_INSET_RATIO * 2);
      const contentHeight = rect.height * (1 + MAP_INSET_RATIO * 2);
      const contentLeft = -MAP_INSET_RATIO * rect.width;
      const contentTop = -MAP_INSET_RATIO * rect.height;
      const extraX = (rect.width * PAN_OVERSCAN_X) / zoomValue;
      const extraY = (rect.height * PAN_OVERSCAN_Y) / zoomValue;

      const minX = rect.width - (contentLeft + contentWidth) * zoomValue - extraX;
      const maxX = -contentLeft * zoomValue + extraX;
      const minY = rect.height - (contentTop + contentHeight) * zoomValue - extraY;
      const maxY = -contentTop * zoomValue + extraY;

      return {
        x: Math.max(minX, Math.min(maxX, nextX)),
        y: Math.max(minY, Math.min(maxY, nextY))
      };
    },
    [MAP_INSET_RATIO, mapZoom]
  );

  const handleMapPointerDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    pointersRef.current[event.pointerId] = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointers = Object.values(pointersRef.current);
    if (pointers.length >= 2) {
      if (!mapCanvasRef.current) return;
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const [first, second] = pointers;
      const midpoint = getMidpoint(first, second);
      pinchStateRef.current = {
        active: true,
        startDistance: Math.max(getDistance(first, second), 1),
        startZoom: mapZoom,
        startOffset: mapOffset,
        startMidpoint: {
          x: midpoint.x - rect.left,
          y: midpoint.y - rect.top
        }
      };
      dragStateRef.current.dragging = false;
      dragStateRef.current.pointerId = null;
      setMapDragging(false);
      return;
    }

    dragStateRef.current.dragging = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    dragStateRef.current.baseX = mapOffset.x;
    dragStateRef.current.baseY = mapOffset.y;
    pinchStateRef.current.active = false;
    setMapDragging(true);
  };

  useEffect(() => {
    function onPointerMove(event) {
      if (pointersRef.current[event.pointerId]) {
        pointersRef.current[event.pointerId] = { x: event.clientX, y: event.clientY };
      }

      const pointers = Object.values(pointersRef.current);
      if (pinchStateRef.current.active && pointers.length >= 2) {
        if (!mapCanvasRef.current) return;
        const rect = mapCanvasRef.current.getBoundingClientRect();
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
        setMapZoom(nextZoom);
        setMapOffset(nextOffset);
        return;
      }

      if (!dragStateRef.current.dragging) return;
      if (dragStateRef.current.pointerId !== null && event.pointerId !== dragStateRef.current.pointerId) {
        return;
      }
      if (event.buttons === 0) {
        dragStateRef.current.dragging = false;
        dragStateRef.current.pointerId = null;
        setMapDragging(false);
        return;
      }
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const next = clampOffset(
        dragStateRef.current.baseX + deltaX,
        dragStateRef.current.baseY + deltaY
      );
      setMapOffset(next);
    }

    function onPointerUp(event) {
      delete pointersRef.current[event.pointerId];

      dragStateRef.current.dragging = false;
      if (
        mapCanvasRef.current &&
        event.pointerId !== undefined &&
        mapCanvasRef.current.hasPointerCapture?.(event.pointerId)
      ) {
        mapCanvasRef.current.releasePointerCapture(event.pointerId);
      }

      if (pinchStateRef.current.active) {
        const remainingPointers = Object.entries(pointersRef.current);
        if (remainingPointers.length >= 2) {
          const [first, second] = remainingPointers.map(([, point]) => point);
          if (!mapCanvasRef.current) return;
          const rect = mapCanvasRef.current.getBoundingClientRect();
          pinchStateRef.current = {
            active: true,
            startDistance: getDistance(first, second),
            startZoom: mapZoom,
            startOffset: mapOffset,
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
          dragStateRef.current.baseX = mapOffset.x;
          dragStateRef.current.baseY = mapOffset.y;
          setMapDragging(true);
          return;
        }
      }

      dragStateRef.current.pointerId = null;
      setMapDragging(false);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [clampOffset, mapOffset, mapZoom]);

  useEffect(() => {
    setMapOffset((prev) => clampOffset(prev.x, prev.y));
  }, [mapZoom, clampOffset]);

  const zoomAroundPoint = (nextZoom, focalX, focalY) => {
    const safeZoom = clampZoom(nextZoom);
    const zoomRatio = safeZoom / mapZoom;
    const nextOffset = clampOffset(
      focalX - zoomRatio * (focalX - mapOffset.x),
      focalY - zoomRatio * (focalY - mapOffset.y),
      safeZoom
    );
    setMapZoom(safeZoom);
    setMapOffset(nextOffset);
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    if (!mapCanvasRef.current) return;
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const focalX = event.clientX - rect.left;
    const focalY = event.clientY - rect.top;
    const direction = event.deltaY > 0 ? -1 : 1;
    zoomAroundPoint(mapZoom + direction * 0.08, focalX, focalY);
  };

  useEffect(() => {
    if (hasCenteredMapRef.current) return;
    if (!mapCanvasRef.current) return;
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const contentWidth = rect.width * (1 + MAP_INSET_RATIO * 2);
    const contentHeight = rect.height * (1 + MAP_INSET_RATIO * 2);
    const contentLeft = -MAP_INSET_RATIO * rect.width;
    const contentTop = -MAP_INSET_RATIO * rect.height;
    const baseX = contentLeft + (userLocation.x / 100) * contentWidth;
    const baseY = contentTop + (userLocation.y / 100) * contentHeight;
    const targetX = rect.width * CENTER_ANCHOR_X - DEFAULT_ZOOM * baseX;
    const targetY = rect.height * CENTER_ANCHOR_Y - DEFAULT_ZOOM * baseY;
    setMapOffset(clampOffset(targetX, targetY, DEFAULT_ZOOM));
    hasCenteredMapRef.current = true;
  }, [clampOffset, mapZoom]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sheetRef.current) return;
    const updateHiddenOffset = () => {
      if (!sheetRef.current) return;
      const nextHiddenOffset = Math.max(
        0,
        sheetRef.current.getBoundingClientRect().height + SHEET_HIDDEN_EXTRA
      );
      setSheetHiddenOffset(nextHiddenOffset);
      setSheetOffset((prev) => Math.min(prev, nextHiddenOffset));
    };

    updateHiddenOffset();
    const observer = new ResizeObserver(() => {
      updateHiddenOffset();
    });
    observer.observe(sheetRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onPointerMove(event) {
      if (!sheetDragRef.current.dragging) return;
      const delta = event.clientY - sheetDragRef.current.startY;
      const nextOffset = sheetDragRef.current.startOffset + delta;
      const clamped = Math.max(0, Math.min(sheetHiddenOffset, nextOffset));
      setSheetOffset(clamped);
    }

    function onPointerUp() {
      if (!sheetDragRef.current.dragging) return;
      sheetDragRef.current.dragging = false;
      setSheetDragging(false);
      setSheetOffset((prev) => (prev > sheetHiddenOffset * 0.35 ? sheetHiddenOffset : 0));
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [sheetHiddenOffset]);

  const handleSheetPointerDown = (event) => {
    sheetDragRef.current.dragging = true;
    sheetDragRef.current.startY = event.clientY;
    sheetDragRef.current.startOffset = sheetOffset;
    setSheetDragging(true);
  };

  const sheetHidden = sheetOffset >= Math.max(0, sheetHiddenOffset - 4);

  return (
    <main className="nav-status-screen">
      <section className="nav-status-map-stage">
        <header className="nav-status-header">
          <div className="nav-status-route-card">
            <div className="nav-status-route-row">
              <span className="nav-dot start" />
              <span>{MYHAL_LABEL}</span>
              <button type="button" className="nav-route-more" aria-label="More route options">
                •••
              </button>
            </div>
            <div className="nav-status-route-divider" />
            <div className="nav-status-route-row">
              <span className="nav-dot end" />
              <span>{order.truck.name}</span>
              <span className="nav-route-summary-pill">{travelMin} min</span>
            </div>
          </div>
          <div className="nav-top-progress-bar" aria-label="Order timeline">
            <div className="nav-top-order-number">Order #{displayOrderNumber}</div>
            <div className="nav-status-timeline nav-status-timeline-top">
              <span className={!timelineReady && !timelineCollected ? "active" : ""}>
                Preparing
              </span>
              <span className={timelineReady && !timelineCollected ? "active" : ""}>Ready</span>
              <span className={timelineCollected ? "active" : ""}>Collected</span>
            </div>
          </div>
        </header>

        <div
          className={`nav-status-map-canvas ${mapDragging ? "dragging" : ""}`}
          ref={mapCanvasRef}
          onPointerDown={handleMapPointerDown}
          onWheel={handleWheelZoom}
        >
          <div
            className="nav-status-map-content"
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`
            }}
          >
            <img className="nav-status-map-image" src="/UniversityofTorontoMap.png" alt="UofT campus map" />
            <svg className="nav-status-route" aria-hidden="true">
              <line
                className="nav-status-route-casing"
                x1={`${userLocation.x}%`}
                y1={`${userLocation.y}%`}
                x2={`${destination.x}%`}
                y2={`${destination.y}%`}
              />
              <line
                className="nav-status-route-main"
                x1={`${userLocation.x}%`}
                y1={`${userLocation.y}%`}
                x2={`${destination.x}%`}
                y2={`${destination.y}%`}
              />
            </svg>
            <div
              className="nav-user-dot"
              style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
              aria-label={MYHAL_LABEL}
            />
            <div
              className="nav-destination-pin"
              style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
              aria-label="Truck location"
            />

          </div>
        </div>
        <section
          ref={sheetRef}
          className={`nav-status-bottom-card nav-style-sheet ${
            sheetDragging ? "dragging" : ""
          }`}
          style={{ transform: `translateY(${sheetOffset}px)` }}
        >
          <div
            className="nav-sheet-drag-zone"
            onPointerDown={handleSheetPointerDown}
            aria-hidden="true"
          />

          <div className="nav-sheet-content">
            <div className="nav-sheet-link-row">
              <button
                type="button"
                className="nav-sheet-link"
                onClick={onBack}
                aria-label="Back to order confirmation"
              >
                My order
              </button>
            </div>

            <div className="nav-eta-summary">
              <strong>{travelMin} min</strong>
              <span>{distanceMeters} m</span>
            </div>
            <div className="nav-food-ready-live">
              <strong>{foodReadyLabel}</strong>
              <span>Ready around {formatClock(readyAtMs)}</span>
            </div>

            <div className="nav-status-bottom-top nav-sheet-truck">
              <img src={order.truck.imageSrc} alt={order.truck.name} />
              <div className="nav-status-bottom-copy">
                <h2>{order.truck.name}</h2>
                <p>{order.truck.cuisine}</p>
              </div>
            </div>

            <button
              type="button"
              className="details-secondary-action nav-status-secondary-cta"
              onClick={onCollected}
            >
              I have arrived
            </button>
          </div>
        </section>
        <button
          type="button"
          className={`nav-sheet-pull-tab ${sheetHidden ? "visible" : ""}`}
          onPointerDown={handleSheetPointerDown}
          onClick={() => setSheetOffset(0)}
          aria-label="Show order card"
        >
          <span className="nav-sheet-pull-tab-pill" />
        </button>
      </section>
    </main>
  );
}
