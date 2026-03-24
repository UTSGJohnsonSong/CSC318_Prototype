import { useEffect, useMemo, useRef, useState } from "react";

function buildWalkRoutePoints(start, end) {
  const laneX = Math.min(start.x, end.x) - 11;
  const turnY = (start.y + end.y) / 2;
  return [
    start,
    { x: laneX, y: start.y - 5.5 },
    { x: laneX, y: turnY },
    { x: end.x - 3.2, y: turnY - 4.2 },
    end
  ];
}

function pointsToPath(points) {
  if (!points.length) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(" ")}`;
}

function getRouteLabelPoint(points) {
  if (points.length < 2) return points[0] ?? { x: 50, y: 50 };
  const from = points[0];
  const to = points[points.length - 1];
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2
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

export default function NavigationStatusScreen({ order, onBack }) {
  if (!order) return null;

  const DEFAULT_ZOOM = 2.1;
  const CENTER_ANCHOR_X = 0.42;
  const CENTER_ANCHOR_Y = 0.24;
  const MAP_INSET_RATIO = 0.08;
  const userLocation = { x: 61, y: 62 };
  const mapCanvasRef = useRef(null);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [nowMs, setNowMs] = useState(Date.now());

  const travelMin = Math.max(1, order.truck.walkTimeMin ?? 3);
  const distanceMeters = Math.max(120, travelMin * 80);
  const destination = useMemo(
    () => ({
      x: order.truck.mapX ?? 64,
      y: order.truck.mapY ?? 34
    }),
    [order.truck.mapX, order.truck.mapY]
  );
  const routePoints = useMemo(
    () => buildWalkRoutePoints(userLocation, destination),
    [destination]
  );
  const routePath = useMemo(() => pointsToPath(routePoints), [routePoints]);
  const routeMid = useMemo(() => getRouteLabelPoint(routePoints), [routePoints]);
  const initialWaitMin = Math.max(1, order.truck.waitTimeMin ?? 1);
  const createdAtMs = order.createdAtMs ?? Date.now();
  const readyAtMs = order.readyAtMs ?? createdAtMs + initialWaitMin * 60 * 1000;
  const elapsedMin = Math.max(0, Math.floor((nowMs - createdAtMs) / 60000));
  const remainingFoodMin = Math.max(0, initialWaitMin - elapsedMin);
  const foodReadyLabel =
    remainingFoodMin > 0 ? `Food ready in ~${remainingFoodMin} min` : "Food ready now";
  const timelineReady = remainingFoodMin <= 0;
  const displayOrderNumber = useMemo(() => {
    if (order.orderNumber) return order.orderNumber;
    return `${getTruckInitials(order.truck.name) || "FT"}-00`;
  }, [order.orderNumber, order.truck.name]);

  useEffect(() => {
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
    setMapOffset({ x: targetX, y: targetY });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="nav-status-screen">
      <section className="nav-status-map-stage">
        <header className="nav-status-header">
          <div className="nav-status-route-card">
            <div className="nav-status-route-row">
              <span className="nav-dot start" />
              <span>Your location</span>
              <button type="button" className="nav-route-more" aria-label="More route options">
                •••
              </button>
            </div>
            <div className="nav-status-route-divider" />
            <div className="nav-status-route-row">
              <span className="nav-dot end" />
              <span>{order.truck.name}</span>
            </div>
          </div>
          <div className="nav-top-progress-bar" aria-label="Order timeline">
            <div className="nav-top-order-number">Order #{displayOrderNumber}</div>
            <div className="nav-status-timeline nav-status-timeline-top">
              <span className={timelineReady ? "" : "active"}>Preparing</span>
              <span className={timelineReady ? "active" : ""}>Ready</span>
              <span>Collected</span>
            </div>
          </div>
        </header>

        <div className="nav-status-map-canvas" ref={mapCanvasRef}>
          <div
            className="nav-status-map-content"
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${DEFAULT_ZOOM})`
            }}
          >
            <img className="nav-status-map-image" src="/UniversityofTorontoMap.png" alt="UofT campus map" />

            <svg className="nav-status-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="nav-status-route-main" d={routePath} />
            </svg>

            <div
              className="nav-user-dot"
              style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
              aria-label="Your location"
            />
            <div
              className="nav-destination-pin"
              style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
              aria-label="Truck location"
            />

            <div
              className="nav-route-badge nav-route-badge-main"
              style={{ left: `${routeMid.x}%`, top: `${routeMid.y}%` }}
            >
              {travelMin} min
            </div>
          </div>
        </div>

        <section className="nav-status-bottom-card nav-style-sheet">
          <button
            type="button"
            className="nav-sheet-close"
            onClick={onBack}
            aria-label="Close navigation status"
          >
            ×
          </button>
          <div className="nav-sheet-handle" />

          <div className="nav-mode-row">
            <button type="button" className="nav-mode-chip">
              Drive
            </button>
            <button type="button" className="nav-mode-chip">
              Transit
            </button>
            <button type="button" className="nav-mode-chip active">Walk</button>
            <button type="button" className="nav-mode-chip">
              Cycle
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

          <button type="button" className="sticky-cta nav-status-primary-cta">Start</button>
        </section>
      </section>
    </main>
  );
}
