import { useEffect, useMemo, useRef, useState } from "react";
import MobileShell from "./components/MobileShell";
import SearchBar from "./components/SearchBar";
import SortDropdown from "./components/SortDropdown";
import MapPanel from "./components/MapPanel";
import TruckCard from "./components/TruckCard";
import TruckDetailScreen from "./components/TruckDetailScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import OrderConfirmationScreen from "./components/OrderConfirmationScreen";
import { trucks } from "./data/trucks";

function getCartItemKey(truckId, itemId) {
  return `${truckId}:${itemId}`;
}

function sortTrucks(data, sortType) {
  const next = [...data];
  if (sortType === "Shortest Wait") {
    return next.sort((a, b) => a.waitTimeMin - b.waitTimeMin);
  }
  if (sortType === "Closest") {
    return next.sort((a, b) => a.walkTimeMin - b.walkTimeMin);
  }
  if (sortType === "Most Recommended") {
    return next.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }
  if (sortType === "Open Now") {
    return next.sort((a, b) => {
      const aOpen = a.status === "open" ? 0 : 1;
      const bOpen = b.status === "open" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return a.waitTimeMin - b.waitTimeMin;
    });
  }
  return next;
}

export default function App() {
  const [sortType, setSortType] = useState("Shortest Wait");
  const [sortVisible, setSortVisible] = useState(true);
  const [selectedTruckId, setSelectedTruckId] = useState("luchi-pink");
  const [focusedTruckId, setFocusedTruckId] = useState(null);
  const [activeTruckId, setActiveTruckId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [mapStackHeight, setMapStackHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(220);
  const [sheetDragging, setSheetDragging] = useState(false);
  const mapStackRef = useRef(null);
  const sheetDragRef = useRef({
    dragging: false,
    startY: 0,
    startHeight: 0
  });

  const sortedTrucks = useMemo(() => sortTrucks(trucks, sortType), [sortType]);
  const displayedTrucks = useMemo(() => {
    if (!focusedTruckId) return sortedTrucks;
    return sortedTrucks.filter((truck) => truck.id === focusedTruckId);
  }, [focusedTruckId, sortedTrucks]);

  useEffect(() => {
    const stillExists = sortedTrucks.some((truck) => truck.id === selectedTruckId);
    if (!stillExists && sortedTrucks.length > 0) {
      setSelectedTruckId(sortedTrucks[0].id);
    }
  }, [selectedTruckId, sortedTrucks]);

  useEffect(() => {
    if (!focusedTruckId) return;
    const exists = sortedTrucks.some((truck) => truck.id === focusedTruckId);
    if (!exists) setFocusedTruckId(null);
  }, [focusedTruckId, sortedTrucks]);

  const activeTruck = sortedTrucks.find((truck) => truck.id === activeTruckId) ?? null;
  const allMenuItems = useMemo(
    () =>
      trucks.flatMap((truck) =>
        (truck.menu ?? []).map((item) => ({
          ...item,
          itemId: item.id,
          truckId: truck.id,
          truckName: truck.name,
          key: getCartItemKey(truck.id, item.id)
        }))
      ),
    []
  );
  const cartLineItems = useMemo(
    () =>
      allMenuItems
        .map((item) => ({
          ...item,
          quantity: cartItems[item.key] ?? 0
        }))
        .filter((item) => item.quantity > 0),
    [allMenuItems, cartItems]
  );
  const cartItemCount = useMemo(
    () => cartLineItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartLineItems]
  );
  const cartTotal = useMemo(
    () => cartLineItems.reduce((sum, item) => sum + item.priceCad * item.quantity, 0),
    [cartLineItems]
  );
  const checkoutTaxFees = useMemo(() => Number((cartTotal * 0.125).toFixed(2)), [cartTotal]);
  const checkoutTotal = useMemo(
    () => Number((cartTotal + checkoutTaxFees).toFixed(2)),
    [cartTotal, checkoutTaxFees]
  );

  const sheetSnapPoints = useMemo(() => {
    const hidden = 56;
    if (!mapStackHeight) {
      return {
        hidden,
        peek: 220,
        expanded: 420
      };
    }
    return {
      hidden,
      peek: Math.round(mapStackHeight * 0.34),
      expanded: Math.round(mapStackHeight * 0.76)
    };
  }, [mapStackHeight]);

  useEffect(() => {
    if (!mapStackRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect?.height) {
        setMapStackHeight(entry.contentRect.height);
      }
    });
    observer.observe(mapStackRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSheetHeight((prev) => {
      const clamped = Math.max(
        sheetSnapPoints.hidden,
        Math.min(sheetSnapPoints.expanded, prev)
      );
      if (clamped !== prev) return clamped;
      if (!mapStackHeight) return prev;
      return sheetSnapPoints.peek;
    });
  }, [mapStackHeight, sheetSnapPoints]);

  useEffect(() => {
    function onPointerMove(event) {
      if (!sheetDragRef.current.dragging) return;
      const delta = sheetDragRef.current.startY - event.clientY;
      const nextHeight = sheetDragRef.current.startHeight + delta;
      const clamped = Math.max(
        sheetSnapPoints.hidden,
        Math.min(sheetSnapPoints.expanded, nextHeight)
      );
      setSheetHeight(clamped);
    }

    function onPointerUp() {
      if (!sheetDragRef.current.dragging) return;
      sheetDragRef.current.dragging = false;
      setSheetDragging(false);
      const candidates = [
        sheetSnapPoints.hidden,
        sheetSnapPoints.peek,
        sheetSnapPoints.expanded
      ];
      const nearest = candidates.reduce((best, current) =>
        Math.abs(current - sheetHeight) < Math.abs(best - sheetHeight) ? current : best
      );
      setSheetHeight(nearest);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [sheetHeight, sheetSnapPoints]);

  const handleSortSelect = (option) => {
    setSortType(option);
  };

  const handleMapPinSelect = (truckId) => {
    setSelectedTruckId(truckId);
    setFocusedTruckId(truckId);
  };

  const handleTruckOpen = (truckId) => {
    setSelectedTruckId(truckId);
    setActiveTruckId(truckId);
    setCartOpen(false);
    setCheckoutOpen(false);
    setConfirmationOpen(false);
  };

  const getItemQuantity = (truckId, itemId) => cartItems[getCartItemKey(truckId, itemId)] ?? 0;

  const updateCartQuantity = (truckId, itemId, updater) => {
    const key = getCartItemKey(truckId, itemId);
    setCartItems((prev) => {
      const currentQuantity = prev[key] ?? 0;
      const nextQuantity =
        typeof updater === "function" ? updater(currentQuantity) : updater;

      if (nextQuantity <= 0) {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: nextQuantity
      };
    });
  };

  const handleAddItem = (truckId, itemId) => {
    updateCartQuantity(truckId, itemId, (current) => current + 1);
  };

  const handleDecreaseItem = (truckId, itemId) => {
    updateCartQuantity(truckId, itemId, (current) => current - 1);
  };

  const handleRemoveItem = (truckId, itemId) => {
    updateCartQuantity(truckId, itemId, 0);
  };

  const handleConfirmOrder = () => {
    if (!activeTruck || !cartLineItems.length) return;

    setConfirmedOrder({
      truck: activeTruck,
      items: cartLineItems,
      pickupName,
      subtotal: cartTotal,
      taxFees: checkoutTaxFees,
      total: checkoutTotal
    });
    setCartItems({});
    setCartOpen(false);
    setCheckoutOpen(false);
    setConfirmationOpen(true);
  };

  const handleSheetPointerDown = (event) => {
    sheetDragRef.current.dragging = true;
    sheetDragRef.current.startY = event.clientY;
    sheetDragRef.current.startHeight = sheetHeight;
    setSheetDragging(true);
  };

  const sheetCollapsed = sheetHeight <= sheetSnapPoints.hidden + 8;

  if (activeTruck) {
    if (confirmationOpen) {
      return (
        <MobileShell>
          <OrderConfirmationScreen
            order={confirmedOrder}
            onBack={() => setConfirmationOpen(false)}
          />
        </MobileShell>
      );
    }

    if (checkoutOpen) {
      return (
        <MobileShell>
          <CheckoutScreen
            truck={activeTruck}
            items={cartLineItems}
            subtotal={cartTotal}
            taxFees={checkoutTaxFees}
            total={checkoutTotal}
            pickupName={pickupName}
            onPickupNameChange={setPickupName}
            onBack={() => setCheckoutOpen(false)}
            onConfirm={handleConfirmOrder}
          />
        </MobileShell>
      );
    }

    return (
      <MobileShell>
        <TruckDetailScreen
          truck={activeTruck}
          cartOpen={cartOpen}
          cartItems={cartLineItems}
          cartTotal={cartTotal}
          cartCount={cartItemCount}
          getItemQuantity={getItemQuantity}
          onAddItem={handleAddItem}
          onDecreaseItem={handleDecreaseItem}
          onRemoveItem={handleRemoveItem}
          onBack={() => setActiveTruckId(null)}
          onOpenCart={() => setCartOpen(true)}
          onCloseCart={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <main className="browse-screen">
        <header className="top-area">
          <SearchBar
            sortVisible={sortVisible}
            onToggleSort={() => setSortVisible((prev) => !prev)}
          />
        </header>

        <section className="map-stack" ref={mapStackRef}>
          <MapPanel
            trucks={sortedTrucks}
            selectedTruckId={selectedTruckId}
            onPinSelect={handleMapPinSelect}
          />
          <div
            className={`sort-overlay ${sortVisible ? "visible" : "hidden"}`}
            aria-hidden={!sortVisible}
          >
            <SortDropdown
              currentSort={sortType}
              onSelect={handleSortSelect}
            />
          </div>

          <section
            className={`truck-sheet ${sheetCollapsed ? "collapsed" : ""} ${
              sheetDragging ? "dragging" : ""
            }`}
            style={{ height: `${sheetHeight}px` }}
            aria-label="Nearby trucks overlay"
          >
            <button
              type="button"
              className="sheet-handle-zone"
              onPointerDown={handleSheetPointerDown}
              aria-label="Drag truck list up or down"
            >
              <span className="sheet-grabber" />
              <span className="sheet-caption">
                {sheetCollapsed
                  ? "Nearby Trucks"
                  : focusedTruckId
                    ? "1 Truck Selected"
                    : `${sortedTrucks.length} Trucks Nearby`}
              </span>
            </button>
            {focusedTruckId && (
              <button
                type="button"
                className="sheet-clear-focus"
                onClick={() => setFocusedTruckId(null)}
                aria-label="Show all trucks"
              >
                ×
              </button>
            )}

            <div className="sheet-content">
              <div className="truck-list sheet-truck-list">
                {displayedTrucks.map((truck) => (
                  <TruckCard
                    key={truck.id}
                    truck={truck}
                    selected={truck.id === selectedTruckId}
                    onSelect={handleTruckOpen}
                  />
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>
    </MobileShell>
  );
}
