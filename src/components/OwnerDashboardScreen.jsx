import { useEffect, useMemo, useState } from "react";

function formatMinutesLabel(minutes) {
  if (minutes <= 1) return "1 min";
  return `${minutes} min`;
}

function createOwnerDemoOrders(truck) {
  const firstItem = truck?.menu?.[0];
  const secondItem = truck?.menu?.[1] ?? firstItem;

  return [
    {
      id: "0423",
      customerName: "Eric Daniels",
      school: "University of Toronto",
      summary: `${firstItem?.name ?? "Combo"} x1`,
      totalLabel: "C$15.59",
      estWaitMin: 9,
      arrivalMin: 3,
      createdAgoMin: 2,
      status: "waiting"
    },
    {
      id: "0424",
      customerName: "Kyle Wong",
      school: "University of Toronto",
      summary: `${secondItem?.name ?? "Rice Bowl"} x1`,
      totalLabel: "C$16.79",
      estWaitMin: 8,
      arrivalMin: 2,
      createdAgoMin: 4,
      status: "waiting"
    },
    {
      id: "0425",
      customerName: "Emma Thompson",
      school: "University of Toronto",
      summary: `${firstItem?.name ?? "Combo"} x2`,
      totalLabel: "C$31.18",
      estWaitMin: 7,
      arrivalMin: 1,
      createdAgoMin: 7,
      status: "pickup",
      notifiedLabel: "Student notified just now"
    },
    {
      id: "0426",
      customerName: "Rachel Garcia",
      school: "University of Toronto",
      summary: `${secondItem?.name ?? "Rice Bowl"} x1`,
      totalLabel: "C$16.79",
      estWaitMin: 12,
      arrivalMin: 5,
      createdAgoMin: 9,
      status: "pickup",
      notifiedLabel: "Ready for pickup 2 min ago"
    }
  ];
}

function createAvatarLabel(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="owner-inline-icon">
      <path
        d="M6 3.5h8a1 1 0 0 1 1 1v11l-2-1.3-1.5 1.3-1.5-1.3-1.5 1.3L7 14.2 5 15.5v-11a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M8 7h4.5M8 10h4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

export default function OwnerDashboardScreen({ truck, ownerName, onTruckLiveUpdate, onSignOut }) {
  const [activeTab, setActiveTab] = useState("waiting");
  const [orders, setOrders] = useState(() => createOwnerDemoOrders(truck));
  const [selectedOrderId, setSelectedOrderId] = useState("0424");
  const [activityMessage, setActivityMessage] = useState(
    "Demo dashboard loaded for UT Little Pink Truck. Choose an order when the meal is ready."
  );

  useEffect(() => {
    setOrders(createOwnerDemoOrders(truck));
  }, [truck]);

  const waitingOrders = useMemo(
    () => orders.filter((order) => order.status === "waiting"),
    [orders]
  );
  const pickupOrders = useMemo(
    () => orders.filter((order) => order.status === "pickup"),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "complete"),
    [orders]
  );

  const tabOrders = activeTab === "waiting" ? waitingOrders : pickupOrders;
  const selectableOrders = tabOrders.length ? tabOrders : activeTab === "waiting" ? pickupOrders : waitingOrders;

  useEffect(() => {
    if (!selectableOrders.length) {
      setSelectedOrderId("");
      return;
    }

    const exists = selectableOrders.some((order) => order.id === selectedOrderId);
    if (!exists) {
      setSelectedOrderId(selectableOrders[0].id);
    }
  }, [selectedOrderId, selectableOrders]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ??
    waitingOrders[0] ??
    pickupOrders[0] ??
    null;

  useEffect(() => {
    if (!truck) return;

    const waitCount = waitingOrders.length;
    const nextWaitMin = Math.max(4, Math.min(18, 4 + waitCount * 2));
    const nextStatus = waitCount >= 4 ? "busy" : waitCount >= 2 ? "moderate" : "open";
    const nextBadge = waitCount <= 1 ? "Shortest Wait" : "Live Queue";

    onTruckLiveUpdate(truck.id, {
      waitTimeMin: nextWaitMin,
      status: nextStatus,
      badge: nextBadge,
      trustNote: "Synced from owner dashboard"
    });
  }, [onTruckLiveUpdate, pickupOrders.length, truck, waitingOrders.length]);

  const handleNotifyReady = (orderId) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    if (!currentOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "pickup",
              notifiedLabel: "Ready for pickup just now",
              arrivalMin: Math.max(1, order.arrivalMin - 1)
            }
          : order
      )
    );
    setSelectedOrderId(orderId);
    setActiveTab("pickup");
    setActivityMessage(`Pickup notification sent to ${currentOrder.customerName}.`);
  };

  const handleMarkPickedUp = (orderId) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    if (!currentOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "complete",
              notifiedLabel: "Picked up"
            }
          : order
      )
    );
    setActivityMessage(`${currentOrder.customerName} has collected the order.`);
  };

  if (!truck) return null;

  return (
    <main className="owner-dashboard-screen">
      <header className="owner-dashboard-header">
        <div className="owner-dashboard-topbar">
          <div>
            <span className="owner-dashboard-kicker">Truck Owner Dashboard</span>
            <h1>{truck.name}</h1>
          </div>
          <button type="button" className="owner-dashboard-signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>

        <section className="owner-dashboard-hero-card">
          <img src={truck.imageSrc} alt={truck.name} className="owner-dashboard-hero-image" />
          <div className="owner-dashboard-hero-copy">
            <strong>{ownerName || truck.name}</strong>
            <span>{truck.cuisine}</span>
            <p>{truck.location}</p>
          </div>
        </section>

        <section className="owner-dashboard-stats">
          <article className="owner-stat-card">
            <span>Public wait</span>
            <strong>{Math.max(4, Math.min(18, 4 + waitingOrders.length * 2))} min</strong>
          </article>
          <article className="owner-stat-card">
            <span>Waiting</span>
            <strong>{waitingOrders.length}</strong>
          </article>
          <article className="owner-stat-card">
            <span>Ready now</span>
            <strong>{pickupOrders.length}</strong>
          </article>
        </section>
      </header>

      <section className="owner-dashboard-shell">
        <div className="owner-tab-switch" role="tablist" aria-label="Owner orders tabs">
          <button
            type="button"
            className={`owner-tab-button ${activeTab === "waiting" ? "active" : ""}`}
            onClick={() => setActiveTab("waiting")}
            aria-pressed={activeTab === "waiting"}
          >
            Order Waiting
          </button>
          <button
            type="button"
            className={`owner-tab-button ${activeTab === "pickup" ? "active" : ""}`}
            onClick={() => setActiveTab("pickup")}
            aria-pressed={activeTab === "pickup"}
          >
            Pickup
          </button>
        </div>

        <section className="owner-highlight-card">
          <div className="owner-highlight-copy">
            <strong>Heads up! Student is arriving in:</strong>
            <span>{selectedOrder ? formatMinutesLabel(selectedOrder.arrivalMin) : "No active orders"}</span>
          </div>
          <select
            className="owner-highlight-select"
            value={selectedOrderId}
            onChange={(event) => setSelectedOrderId(event.target.value)}
          >
            {selectableOrders.map((order) => (
              <option key={order.id} value={order.id}>
                #{order.id} {order.customerName}
              </option>
            ))}
          </select>
        </section>

        <div className="owner-activity-banner">{activityMessage}</div>

        <div className="owner-order-list">
          {tabOrders.map((order) => {
            const isPickup = order.status === "pickup";

            return (
              <article key={order.id} className="owner-order-card">
                <div className="owner-order-topline">
                  <span>Order #{order.id}</span>
                  <span className="owner-order-timer">{formatMinutesLabel(order.createdAgoMin)}</span>
                </div>

                <div className="owner-order-main">
                  <div className="owner-order-avatar" aria-hidden="true">
                    {createAvatarLabel(order.customerName)}
                  </div>

                  <div className="owner-order-copy">
                    <strong>{order.customerName}</strong>
                    <span>{order.school}</span>
                    <p>{order.summary}</p>
                    <div className="owner-order-meta">
                      <span>Est. Wait: {formatMinutesLabel(order.estWaitMin)}</span>
                      <span>{order.totalLabel}</span>
                    </div>
                    <div className={`owner-order-note ${isPickup ? "pickup" : "waiting"}`}>
                      {isPickup
                        ? order.notifiedLabel ?? "Ready for pickup"
                        : `Student arriving in ${formatMinutesLabel(order.arrivalMin)}`}
                    </div>
                  </div>
                </div>

                <div className="owner-order-actions">
                  <button
                    type="button"
                    className={`owner-order-primary ${isPickup ? "pickup" : ""}`}
                    onClick={() => (isPickup ? handleMarkPickedUp(order.id) : handleNotifyReady(order.id))}
                  >
                    {isPickup ? "Mark picked up" : "Notify ready"}
                  </button>
                  <button type="button" className="owner-order-secondary">
                    <ReceiptIcon />
                    <span>View receipt</span>
                  </button>
                </div>
              </article>
            );
          })}

          {!tabOrders.length ? (
            <div className="owner-empty-state">
              {activeTab === "waiting"
                ? "No waiting orders right now. New student orders will appear here."
                : "No pickup orders left. Mark a meal ready to move it into this tab."}
            </div>
          ) : null}
        </div>

        <footer className="owner-dashboard-footer">
          <span>{completedOrders.length} completed orders today</span>
          <span>Front-end demo only</span>
        </footer>
      </section>
    </main>
  );
}
