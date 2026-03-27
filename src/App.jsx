import { useEffect, useMemo, useRef, useState } from "react";
import MobileShell from "./components/MobileShell";
import SearchBar from "./components/SearchBar";
import SortDropdown from "./components/SortDropdown";
import MapPanel from "./components/MapPanel";
import TruckCard from "./components/TruckCard";
import SearchAssistPanel from "./components/SearchAssistPanel";
import MobileKeyboardMock from "./components/MobileKeyboardMock";
import TruckDetailScreen from "./components/TruckDetailScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import OrderConfirmationScreen from "./components/OrderConfirmationScreen";
import NavigationStatusScreen from "./components/NavigationStatusScreen";
import RatingScreen from "./components/RatingScreen";
import AuthScreen from "./components/AuthScreen";
import OwnerDashboardScreen from "./components/OwnerDashboardScreen";
import UserProfileScreen from "./components/UserProfileScreen";
import { trucks } from "./data/trucks";

const AUTH_ACCOUNTS_STORAGE_KEY = "campus-food-demo-accounts";
const AUTH_SESSION_STORAGE_KEY = "campus-food-demo-session";
const PAYMENT_METHOD_STORAGE_KEY = "campus-food-demo-payment-method";

const PAYMENT_METHOD_OPTIONS = [
  {
    id: "visa-1234",
    type: "Visa",
    badge: "VISA",
    summary: "•••• 1234",
    detail: "Personal card"
  },
  {
    id: "mastercard-4242",
    type: "Mastercard",
    badge: "MC",
    summary: "•••• 4242",
    detail: "Backup card"
  },
  {
    id: "apple-pay",
    type: "Apple Pay",
    badge: "PAY",
    summary: "Apple Pay",
    detail: "Touch ID ready"
  }
];

const TRUCK_OWNER_DEMO_ID = "luchi-pink";

function getCartItemKey(truckId, itemId) {
  return `${truckId}:${itemId}`;
}

function getTruckInitials(truckName) {
  return truckName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

function createOrderNumber(truckName) {
  const prefix = getTruckInitials(truckName) || "FT";
  const suffix = String(Math.floor(Math.random() * 90 + 10));
  return `${prefix}-${suffix}`;
}

function getUserInitials(session) {
  const source =
    session?.mode === "visitor" ? "Visitor" : session?.name || session?.email || "User";

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function readStoredAccounts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredAccounts(accounts) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readStoredPaymentMethod() {
  if (typeof window === "undefined") return PAYMENT_METHOD_OPTIONS[0].id;
  try {
    const stored = window.localStorage.getItem(PAYMENT_METHOD_STORAGE_KEY);
    const exists = PAYMENT_METHOD_OPTIONS.some((option) => option.id === stored);
    return exists ? stored : PAYMENT_METHOD_OPTIONS[0].id;
  } catch {
    return PAYMENT_METHOD_OPTIONS[0].id;
  }
}

function writeStoredPaymentMethod(methodId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PAYMENT_METHOD_STORAGE_KEY, methodId);
}

function sortTrucks(data, sortType) {
  const next = [...data];
  if (sortType === "Fastest" || sortType === "Shortest Wait") {
    return next.sort((a, b) => a.waitTimeMin - b.waitTimeMin);
  }
  if (sortType === "Closest") {
    return next.sort((a, b) => a.walkTimeMin - b.walkTimeMin);
  }
  if (sortType === "Recommended" || sortType === "Most Recommended") {
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

const SEARCH_RECENT_DEFAULT = [
  { label: "fried chicken", kind: "query" },
  { label: "bubble tea", kind: "query" },
  { label: "Ali's Wraps", kind: "query" },
  { label: "Blue Truck", kind: "entity" }
];

function getAuthNotice(portal, view) {
  if (portal === "owner") {
    return view === "login"
      ? "Truck owner portal preview. Sign-in UI is ready; dashboard flow can be connected next."
      : "Contact us to register: 9amdesigner@truck.com";
  }

  return view === "login"
    ? "This is a front-end demo. Accounts are stored only in this browser."
    : "Create any demo credentials you want, then enter the prototype immediately.";
}

function normalizeText(value) {
  return value.toLowerCase().trim();
}

function isMeaningfulSearchTerm(value) {
  const term = value.trim();
  if (term.length < 3) return false;
  if (!/[a-zA-Z]/.test(term)) return false;
  return true;
}

function normalizeRecentEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    const label = entry.trim();
    if (!isMeaningfulSearchTerm(label)) return null;
    return { label, kind: "query" };
  }
  if (typeof entry === "object" && typeof entry.label === "string") {
    const label = entry.label.trim();
    if (!isMeaningfulSearchTerm(label)) return null;
    return {
      label,
      kind: entry.kind === "entity" ? "entity" : "query"
    };
  }
  return null;
}

function getTruckSearchScore(truck, query) {
  const normalized = normalizeText(query);
  if (!normalized) return 0;

  let score = 0;
  const name = normalizeText(truck.name);
  const cuisine = normalizeText(truck.cuisine);
  const foods = (truck.searchFoods ?? []).map(normalizeText);
  const intents = (truck.intentTags ?? []).map(normalizeText);

  if (name.includes(normalized)) score += name.startsWith(normalized) ? 12 : 8;
  if (cuisine.includes(normalized)) score += 6;
  if (foods.some((food) => food.includes(normalized))) score += 7;
  if (intents.some((tag) => tag.includes(normalized))) score += 9;

  if (normalized.includes("open") && truck.status === "open") score += 7;
  if ((normalized.includes("quick") || normalized.includes("fast")) && truck.waitTimeMin <= 9) score += 6;
  if (normalized.includes("cheap") && truck.walkTimeMin <= 8) score += 4;
  if (normalized.includes("shortest wait") && truck.waitTimeMin <= 9) score += 8;
  if (normalized.includes("under 15 min") && truck.waitTimeMin + truck.walkTimeMin <= 15) score += 10;
  if (normalized.includes("under $15") || normalized.includes("under 15")) {
    if (intents.some((tag) => tag.includes("cheap"))) score += 9;
  }
  if (normalized.includes("closest") && truck.walkTimeMin <= 5) score += 8;

  return score;
}

export default function App() {
  const [authPortal, setAuthPortal] = useState("user");
  const [authView, setAuthView] = useState("login");
  const [authState, setAuthState] = useState(() => readStoredSession());
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState(() => getAuthNotice("user", "login"));
  const [sortType, setSortType] = useState("Fastest");
  const [sortVisible, setSortVisible] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(() =>
    readStoredPaymentMethod()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(SEARCH_RECENT_DEFAULT);
  const [selectedTruckId, setSelectedTruckId] = useState("luchi-pink");
  const [focusedTruckId, setFocusedTruckId] = useState(null);
  const [activeTruckId, setActiveTruckId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [navigationStatusOpen, setNavigationStatusOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [truckFeedbackById, setTruckFeedbackById] = useState({});
  const [truckLiveOverridesById, setTruckLiveOverridesById] = useState({});
  const [pickupName, setPickupName] = useState("");
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [mapStackHeight, setMapStackHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(190);
  const [sheetDragging, setSheetDragging] = useState(false);
  const mapStackRef = useRef(null);
  const sheetDragRef = useRef({
    dragging: false,
    startY: 0,
    startHeight: 0
  });

  const trucksWithFeedback = useMemo(
    () =>
      trucks.map((truck) => ({
        ...truck,
        ...(truckLiveOverridesById[truck.id] ?? {}),
        userWaitFeedback: truckFeedbackById[truck.id] ?? null
      })),
    [truckFeedbackById, truckLiveOverridesById]
  );
  const sortedTrucks = useMemo(
    () => sortTrucks(trucksWithFeedback, sortType),
    [sortType, trucksWithFeedback]
  );
  const isSearchMode = searchFocused;
  const queryActive = searchQuery.trim().length > 0;
  const searchRankedTrucks = useMemo(() => {
    if (!queryActive) return sortedTrucks;

    return [...sortedTrucks]
      .map((truck) => ({
        truck,
        score: getTruckSearchScore(truck, searchQuery)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.truck.waitTimeMin - b.truck.waitTimeMin;
      })
      .map((item) => item.truck);
  }, [queryActive, searchQuery, sortedTrucks]);

  const groupedSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { trucks: [], foods: [], categories: [] };
    }

    const truckSuggestions = sortedTrucks
      .filter((truck) => truck.name.toLowerCase().includes(query))
      .slice(0, 4)
      .map((truck) => ({ label: truck.name, value: truck.name, hint: "Truck" }));

    const foodPool = Array.from(
      new Set(sortedTrucks.flatMap((truck) => truck.searchFoods ?? []).map((food) => food.trim()))
    );
    const foodSuggestions = foodPool
      .filter((food) => food.toLowerCase().includes(query))
      .slice(0, 4)
      .map((food) => ({ label: food, value: food, hint: "Food" }));

    const categoryPool = Array.from(
      new Set([
        ...sortedTrucks.map((truck) => truck.cuisine),
        ...sortedTrucks.flatMap((truck) => truck.intentTags ?? [])
      ])
    );
    const categorySuggestions = categoryPool
      .filter((value) => value.toLowerCase().includes(query))
      .slice(0, 4)
      .map((value) => ({ label: value, value, hint: "Category" }));

    return {
      trucks: truckSuggestions,
      foods: foodSuggestions,
      categories: categorySuggestions
    };
  }, [searchQuery, sortedTrucks]);

  const cleanRecentSearches = useMemo(
    () =>
      recentSearches
        .map(normalizeRecentEntry)
        .filter(Boolean)
        .slice(0, 6),
    [recentSearches]
  );

  const displayedTrucks = useMemo(() => {
    const source = queryActive ? searchRankedTrucks : sortedTrucks;
    if (!focusedTruckId) return source;
    return source.filter((truck) => truck.id === focusedTruckId);
  }, [focusedTruckId, queryActive, searchRankedTrucks, sortedTrucks]);

  useEffect(() => {
    const stillExists = displayedTrucks.some((truck) => truck.id === selectedTruckId);
    if (!stillExists && displayedTrucks.length > 0) {
      setSelectedTruckId(displayedTrucks[0].id);
    }
  }, [selectedTruckId, displayedTrucks]);

  useEffect(() => {
    if (!focusedTruckId) return;
    const exists = displayedTrucks.some((truck) => truck.id === focusedTruckId);
    if (!exists) setFocusedTruckId(null);
  }, [focusedTruckId, displayedTrucks]);

  useEffect(() => {
    if (!queryActive) return;
    if (!searchRankedTrucks.length) return;
    setSelectedTruckId(searchRankedTrucks[0].id);
  }, [queryActive, searchRankedTrucks]);

  useEffect(() => {
    setRecentSearches((prev) =>
      prev
        .map(normalizeRecentEntry)
        .filter(Boolean)
        .slice(0, 6)
    );
  }, []);

  const activeTruck = trucksWithFeedback.find((truck) => truck.id === activeTruckId) ?? null;
  const allMenuItems = useMemo(
    () =>
      trucksWithFeedback.flatMap((truck) =>
        (truck.menu ?? []).map((item) => ({
          ...item,
          itemId: item.id,
          truckId: truck.id,
          truckName: truck.name,
          key: getCartItemKey(truck.id, item.id)
        }))
      ),
    [trucksWithFeedback]
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
  const selectedPaymentMethod =
    PAYMENT_METHOD_OPTIONS.find((option) => option.id === selectedPaymentMethodId) ??
    PAYMENT_METHOD_OPTIONS[0];
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
        peek: 190,
        expanded: 420
      };
    }
    return {
      hidden,
      peek: Math.round(mapStackHeight * 0.28),
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

  const handleAuthViewChange = (nextView) => {
    setAuthView(nextView);
    setAuthError("");
    setAuthNotice(getAuthNotice(authPortal, nextView));
  };

  const handleAuthPortalChange = (nextPortal) => {
    setAuthPortal(nextPortal);
    setAuthView("login");
    setAuthError("");
    setAuthNotice(getAuthNotice(nextPortal, "login"));
  };

  const handleOwnerDemoBypass = () => {
    const demoTruck = trucks.find((item) => item.id === TRUCK_OWNER_DEMO_ID);
    const nextSession = {
      mode: "owner",
      name: demoTruck?.name ?? "Truck Owner",
      email: "9amdesigner@truck.com",
      truckId: TRUCK_OWNER_DEMO_ID
    };

    setAuthPortal("owner");
    setAuthView("login");
    setAuthState(nextSession);
    writeStoredSession(nextSession);
    setAuthError("");
    setAuthNotice("");
  };

  const handleLogin = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setAuthError("Please enter both email and password.");
      setAuthNotice("");
      return;
    }

    if (authPortal === "owner") {
      setAuthError("");
      setAuthNotice(
        "Truck owner sign-in page is ready. The owner dashboard flow has not been connected yet."
      );
      return;
    }

    const accounts = readStoredAccounts();
    const account = accounts.find((item) => item.email === normalizedEmail);

    if (!account) {
      setAuthError("No demo account matches that email yet. Please register first.");
      setAuthNotice("");
      return;
    }

    if (account.password !== trimmedPassword) {
      setAuthError("Incorrect password. Please try again.");
      setAuthNotice("");
      return;
    }

    const nextSession = {
      mode: "member",
      name: account.name,
      email: account.email
    };

    setAuthState(nextSession);
    writeStoredSession(nextSession);
    setAuthError("");
    setAuthNotice("");
  };

  const handleRegister = async ({ name, email, password, confirmPassword }) => {
    if (authPortal === "owner") {
      setAuthError("");
      setAuthNotice(getAuthNotice("owner", "register"));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setAuthError("Email and password are required.");
      setAuthNotice("");
      return;
    }

    if (trimmedPassword.length < 4) {
      setAuthError("Please use a password with at least 4 characters for the demo.");
      setAuthNotice("");
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setAuthError("Passwords do not match.");
      setAuthNotice("");
      return;
    }

    const accounts = readStoredAccounts();
    const existingAccount = accounts.find((item) => item.email === normalizedEmail);

    if (existingAccount) {
      setAuthError("That email is already registered. Please log in instead.");
      setAuthNotice("");
      return;
    }

    const nextAccount = {
      name: trimmedName || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: trimmedPassword
    };
    const nextAccounts = [...accounts, nextAccount];
    const nextSession = {
      mode: "member",
      name: nextAccount.name,
      email: nextAccount.email
    };

    writeStoredAccounts(nextAccounts);
    writeStoredSession(nextSession);
    setAuthState(nextSession);
    setAuthError("");
    setAuthNotice("");
  };

  const handleVisitorSignIn = () => {
    const nextSession = {
      mode: "visitor",
      name: "Visitor",
      email: ""
    };
    setAuthState(nextSession);
    writeStoredSession(nextSession);
    setAuthError("");
    setAuthNotice("");
  };

  const handleSignOut = () => {
    const nextPortal = authState?.mode === "owner" ? "owner" : authPortal;
    setAuthState(null);
    writeStoredSession(null);
    setProfileOpen(false);
    setAuthPortal(nextPortal);
    setAuthView("login");
    setAuthError("");
    setAuthNotice(
      nextPortal === "owner"
        ? "Signed out. Use demo bypass or sign in again to reopen the truck owner dashboard."
        : "Signed out. You can log in again or continue as a visitor."
    );
    setSearchQuery("");
    setSearchFocused(false);
    setFocusedTruckId(null);
    setActiveTruckId(null);
    setCartOpen(false);
    setCheckoutOpen(false);
    setConfirmationOpen(false);
    setNavigationStatusOpen(false);
    setRatingOpen(false);
    setCartItems({});
    setConfirmedOrder(null);
    setPickupName("");
  };

  const handleTruckLiveUpdate = (truckId, updates) => {
    setTruckLiveOverridesById((prev) => ({
      ...prev,
      [truckId]: {
        ...(prev[truckId] ?? {}),
        ...updates
      }
    }));
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethodId(methodId);
    writeStoredPaymentMethod(methodId);
  };

  const applySearch = (value) => {
    setSearchQuery(value);
    setFocusedTruckId(null);
  };

  const commitRecentSearch = (value, kind = "query") => {
    if (!isMeaningfulSearchTerm(value)) return;
    const normalized = value.trim();
    setRecentSearches((prev) => {
      const merged = [
        { label: normalized, kind },
        ...prev
          .map(normalizeRecentEntry)
          .filter(Boolean)
          .filter((entry) => entry.label.toLowerCase() !== normalized.toLowerCase())
      ];
      return merged.slice(0, 6);
    });
  };

  const handleSearchSubmit = (value) => {
    const term = value.trim();
    if (!term) return;
    applySearch(term);
    commitRecentSearch(term, "query");
    setSearchFocused(false);
  };

  const handleSearchCancel = () => {
    setSearchQuery("");
    setSearchFocused(false);
    setFocusedTruckId(null);
  };

  const handleMapPinSelect = (truckId) => {
    setSelectedTruckId(truckId);
    setFocusedTruckId(truckId);
    setSearchFocused(false);
  };

  const handleTruckOpen = (truckId) => {
    setSelectedTruckId(truckId);
    setActiveTruckId(truckId);
    setCartOpen(false);
    setCheckoutOpen(false);
    setConfirmationOpen(false);
    setNavigationStatusOpen(false);
    setRatingOpen(false);
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
    const createdAtMs = Date.now();
    const readyAtMs = createdAtMs + activeTruck.waitTimeMin * 60 * 1000;

    setConfirmedOrder({
      orderNumber: createOrderNumber(activeTruck.name),
      createdAtMs,
      readyAtMs,
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
    setNavigationStatusOpen(false);
    setRatingOpen(false);
    setConfirmationOpen(true);
  };

  const handleCollectedOrder = () => {
    setConfirmedOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        collectedAtMs: Date.now()
      };
    });
    setNavigationStatusOpen(false);
    setRatingOpen(true);
  };

  const handleOwnerMarkPickedUp = ({ orderNumber }) => {
    setConfirmedOrder((prev) => {
      if (!prev) return prev;
      if (orderNumber && prev.orderNumber !== orderNumber) return prev;
      if (prev.collectedAtMs) return prev;
      return {
        ...prev,
        collectedAtMs: Date.now(),
        pickedUpBySeller: true
      };
    });
  };

  const handleUploadWaitFeedback = ({ truckId, deltaMin, actualPickupAtMs }) => {
    const nextFeedback = {
      deltaMin,
      actualPickupAtMs,
      submittedAtMs: Date.now()
    };

    setTruckFeedbackById((prev) => ({
      ...prev,
      [truckId]: nextFeedback
    }));

    setConfirmedOrder((prev) => {
      if (!prev || prev.truck.id !== truckId) return prev;
      return {
        ...prev,
        waitTimeFeedback: nextFeedback
      };
    });
  };

  const handleSubmitRating = ({ rating, comment }) => {
    setConfirmedOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        feedback: {
          rating,
          comment,
          waitTimeFeedback: prev.waitTimeFeedback ?? null,
          submittedAtMs: Date.now()
        }
      };
    });
    setRatingOpen(false);
    setConfirmationOpen(false);
    setNavigationStatusOpen(false);
    setActiveTruckId(null);
    setFocusedTruckId(null);
  };

  const handleSheetPointerDown = (event) => {
    if (searchFocused) return;
    sheetDragRef.current.dragging = true;
    sheetDragRef.current.startY = event.clientY;
    sheetDragRef.current.startHeight = sheetHeight;
    setSheetDragging(true);
  };

  const sheetCollapsed = sheetHeight <= sheetSnapPoints.hidden + 8;
  const hideRecenter = sheetHeight >= sheetSnapPoints.expanded - 6;

  if (!authState) {
    return (
      <MobileShell>
        <AuthScreen
          portal={authPortal}
          mode={authView}
          error={authError}
          notice={authNotice}
          onPortalChange={handleAuthPortalChange}
          onModeChange={handleAuthViewChange}
          onLogin={handleLogin}
          onOwnerDemoBypass={handleOwnerDemoBypass}
          onRegister={handleRegister}
          onVisitor={handleVisitorSignIn}
        />
      </MobileShell>
    );
  }

  if (authState?.mode === "owner") {
    const ownerTruck =
      trucksWithFeedback.find((truck) => truck.id === authState.truckId) ??
      trucksWithFeedback.find((truck) => truck.id === TRUCK_OWNER_DEMO_ID) ??
      null;
    const ownerLinkedOrder =
      confirmedOrder && ownerTruck && confirmedOrder.truck.id === ownerTruck.id
        ? confirmedOrder
        : null;

    return (
      <MobileShell>
        <OwnerDashboardScreen
          truck={ownerTruck}
          ownerName={authState.name}
          activeOrder={ownerLinkedOrder}
          onMarkOrderPickedUp={handleOwnerMarkPickedUp}
          onTruckLiveUpdate={handleTruckLiveUpdate}
          onSignOut={handleSignOut}
        />
      </MobileShell>
    );
  }

  if (profileOpen) {
    return (
      <MobileShell>
        <UserProfileScreen
          authState={authState}
          avatarLabel={getUserInitials(authState)}
          paymentMethods={PAYMENT_METHOD_OPTIONS}
          selectedPaymentMethodId={selectedPaymentMethod.id}
          onBack={() => setProfileOpen(false)}
          onSelectPaymentMethod={handlePaymentMethodChange}
          onSignOut={handleSignOut}
        />
      </MobileShell>
    );
  }

  if (activeTruck) {
    if (ratingOpen) {
      return (
        <MobileShell>
          <RatingScreen
            order={confirmedOrder}
            onBack={() => {
              setRatingOpen(false);
              setNavigationStatusOpen(true);
            }}
            onUploadWaitFeedback={handleUploadWaitFeedback}
            onSubmit={handleSubmitRating}
          />
        </MobileShell>
      );
    }

    if (navigationStatusOpen) {
      return (
        <MobileShell>
          <NavigationStatusScreen
            order={confirmedOrder}
            onBack={() => {
              setNavigationStatusOpen(false);
              setConfirmationOpen(true);
            }}
            onCollected={handleCollectedOrder}
          />
        </MobileShell>
      );
    }

    if (confirmationOpen) {
      return (
        <MobileShell>
          <OrderConfirmationScreen
            order={confirmedOrder}
            onBack={() => setConfirmationOpen(false)}
            onNavigate={() => {
              setNavigationStatusOpen(true);
            }}
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
            paymentMethods={PAYMENT_METHOD_OPTIONS}
            paymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
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
          <div className={`top-search-row ${searchFocused ? "search-focused" : ""}`}>
            <SearchBar
              value={searchQuery}
              focused={searchFocused}
              onFocus={() => setSearchFocused(true)}
              onChange={applySearch}
              onSubmit={handleSearchSubmit}
              onClear={() => setSearchQuery("")}
              onCancel={handleSearchCancel}
            />
            <button
              type="button"
              className="profile-entry-button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open user profile"
            >
              <span className="profile-entry-avatar">{getUserInitials(authState)}</span>
            </button>
          </div>
        </header>

        <section className={`map-stack ${isSearchMode ? "search-mode" : ""}`} ref={mapStackRef}>
          <MapPanel
            trucks={sortedTrucks}
            selectedTruckId={selectedTruckId}
            onPinSelect={handleMapPinSelect}
            recenterSignal={recenterSignal}
            queryActive={queryActive}
            matchedTruckIds={searchRankedTrucks.map((truck) => truck.id)}
          />
          <div className={`search-mode-dimmer ${isSearchMode ? "visible" : ""}`} aria-hidden="true" />
          <div
            className={`sort-overlay ${sortVisible && !searchFocused ? "visible" : "hidden"}`}
            aria-hidden={!sortVisible || searchFocused}
          >
            <SortDropdown
              currentSort={sortType}
              onSelect={handleSortSelect}
            />
          </div>
          <SearchAssistPanel
            focused={searchFocused}
            query={searchQuery}
            totalResults={searchRankedTrucks.length}
            searchResults={searchRankedTrucks}
            groupedSuggestions={groupedSuggestions}
            recentSearches={cleanRecentSearches}
            onSelectSuggestion={(value) => {
              applySearch(value);
              commitRecentSearch(value, "query");
              setSearchFocused(false);
            }}
            onSelectResult={(truckId) => {
              setSelectedTruckId(truckId);
              setFocusedTruckId(truckId);
              const truck = sortedTrucks.find((item) => item.id === truckId);
              if (truck) {
                setSearchQuery(truck.name);
                commitRecentSearch(truck.name, "entity");
              }
              setSearchFocused(false);
            }}
          />

          <section
            className={`truck-sheet ${sheetCollapsed ? "collapsed" : ""} ${
              sheetDragging ? "dragging" : ""
            } ${searchFocused ? "keyboard-active search-hidden" : ""
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
                    : queryActive
                      ? `${displayedTrucks.length} Search Matches`
                      : "Showing 6 nearby · UofT St. George"}
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
                    query={searchQuery}
                  />
                ))}
                {queryActive && displayedTrucks.length === 0 ? (
                  <div className="sheet-empty-state">
                    <p>No trucks match this search.</p>
                    <span>Try “cheap lunch”, “bubble tea”, or “halal”.</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
          <button
            type="button"
            className={`map-recenter-fab ${hideRecenter || searchFocused ? "hidden" : ""}`}
            style={{ bottom: `${sheetHeight + 10}px` }}
            onClick={() => setRecenterSignal((prev) => prev + 1)}
            aria-label="Center map on your location"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M19 4L5.5 10.2C4.7 10.6 4.8 11.8 5.7 12L11.3 13.5L12.8 19.1C13 20 14.2 20.1 14.6 19.3L20.8 5.8C21.2 5 20.5 3.6 19 4Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <MobileKeyboardMock visible={searchFocused} />
        </section>
      </main>
    </MobileShell>
  );
}
