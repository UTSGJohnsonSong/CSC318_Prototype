import QuantityControl from "./QuantityControl";
import CartScreen from "./CartScreen";

function getStatusTone(status) {
  if (status === "open") return "badge-fast";
  if (status === "moderate") return "badge-moderate";
  return "badge-busy";
}

function getStatusLabel(status) {
  if (status === "open") return "Open Now";
  if (status === "moderate") return "Limited Availability";
  return "Busy Now";
}

export default function TruckDetailScreen({
  truck,
  cartOpen,
  cartItems,
  cartTotal,
  cartCount,
  getItemQuantity,
  onAddItem,
  onDecreaseItem,
  onRemoveItem,
  onBack,
  onOpenCart,
  onCloseCart,
  onCheckout
}) {
  if (!truck) return null;

  return (
    <main className="details-screen">
      <header className="details-header">
        <button type="button" className="details-back" onClick={onBack}>
          Back
        </button>
        <span className="details-title">{truck.name}</span>
        <span className="details-spacer" />
      </header>

      <div className={`details-scroll ${cartOpen ? "cart-visible" : ""}`}>
        <section className="details-hero">
          {truck.imageSrc ? (
            <img src={truck.imageSrc} alt={truck.name} />
          ) : (
            <div className="details-hero-fallback">{truck.image}</div>
          )}
        </section>

        <section className="details-card details-overview-card">
          <div className="details-overview-top">
            <div>
              <h1 className="details-name">{truck.name}</h1>
              <p className="details-cuisine">{truck.cuisine}</p>
            </div>
            <span className={`status-badge ${getStatusTone(truck.status)}`}>
              {getStatusLabel(truck.status)}
            </span>
          </div>

          <div className="details-rating-row">
            <span className="details-stars" aria-hidden="true">
              ★★★★★
            </span>
            <span className="details-rating-copy">
              {truck.rating.toFixed(1)} {truck.reviewCount} reviews
            </span>
          </div>
        </section>

        <section className="details-stats-grid" aria-label="Truck details">
          <article className="details-card details-stat-card">
            <span className="details-stat-label">Est. wait</span>
            <strong className="details-stat-value">{truck.waitTimeMin} min</strong>
            <span className="details-stat-note">{truck.trustNote}</span>
          </article>

          <article className="details-card details-stat-card">
            <span className="details-stat-label">Walk time</span>
            <strong className="details-stat-value">{truck.walkTimeMin} min</strong>
            <span className="details-stat-note">From your current spot</span>
          </article>
        </section>

        <section className="details-card details-status-panel">
          <div className="details-status-head">
            <span className="details-section-label">Open status</span>
            <span className={`status-badge ${getStatusTone(truck.status)}`}>
              {getStatusLabel(truck.status)}
            </span>
          </div>
          <p className="details-status-copy">
            Live wait and availability are refreshed based on recent user activity.
          </p>
          <div className="details-meta-row">
            <span className="walk-pill">{truck.badge}</span>
            <span className="trust-note">{truck.trustNote}</span>
          </div>
        </section>

        {truck.menu?.length ? (
          <section className="details-card details-menu-panel">
            <div className="details-status-head">
              <span className="details-section-label">Menu</span>
            </div>
            <div className="details-menu-list">
              {truck.menu.map((item) => (
                <article key={item.id} className="details-menu-item">
                  <div className="details-menu-thumb">
                    <img src={item.imageSrc} alt={item.name} />
                  </div>
                  <div className="details-menu-copy">
                    <div className="details-menu-main">
                      <div>
                        <h2 className="details-menu-name">{item.name}</h2>
                        <p className="details-menu-description">{item.description}</p>
                      </div>
                      <div className="details-menu-side">
                        <div className="details-menu-price">
                          C${item.priceCad.toFixed(2)}
                        </div>
                        <QuantityControl
                          quantity={getItemQuantity(truck.id, item.id)}
                          onIncrease={() => onAddItem(truck.id, item.id)}
                          onDecrease={() => onDecreaseItem(truck.id, item.id)}
                        />
                      </div>
                    </div>
                    <div className="details-menu-subprice">
                      Approx. RMB {item.priceRmb.toFixed(2)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer className={`details-actions ${cartOpen ? "hidden" : ""}`}>
        <button type="button" className="sticky-cta" onClick={onOpenCart}>
          Cart{cartCount ? ` (${cartCount})` : ""}
        </button>
      </footer>

      {cartOpen ? (
        <CartScreen
          items={cartItems}
          total={cartTotal}
          itemCount={cartCount}
          onClose={onCloseCart}
          onCheckout={onCheckout}
          onIncrease={onAddItem}
          onDecrease={onDecreaseItem}
          onRemove={onRemoveItem}
        />
      ) : null}
    </main>
  );
}
