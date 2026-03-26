function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="profile-method-check">
      <path
        d="m5.5 10.4 2.8 2.8 6.2-6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function UserProfileScreen({
  authState,
  avatarLabel,
  paymentMethods,
  selectedPaymentMethodId,
  onBack,
  onSelectPaymentMethod,
  onSignOut
}) {
  const isVisitor = authState?.mode === "visitor";
  const displayName = isVisitor ? "Visitor" : authState?.name || authState?.email || "User";

  return (
    <main className="profile-screen">
      <header className="profile-header">
        <button type="button" className="details-back" onClick={onBack}>
          Back
        </button>
        <span className="details-title">User Profile</span>
        <span className="details-spacer" />
      </header>

      <div className="profile-scroll">
        <section className="profile-card profile-hero-card">
          <div className="profile-avatar-large" aria-hidden="true">
            {avatarLabel}
          </div>
          <div className="profile-hero-copy">
            <h1>{displayName}</h1>
            <span className={`profile-status-badge ${isVisitor ? "visitor" : "member"}`}>
              {isVisitor ? "Visitor Mode" : "Signed In"}
            </span>
            <p>
              {isVisitor
                ? "You are browsing without an account."
                : "Your demo account information is stored in this browser."}
            </p>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-head">
            <span className="details-section-label">Account</span>
          </div>
          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-info-label">Status</span>
              <strong>{isVisitor ? "Visitor" : "Member"}</strong>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Display Name</span>
              <strong>{displayName}</strong>
            </div>
            {!isVisitor ? (
              <div className="profile-info-row">
                <span className="profile-info-label">Email</span>
                <strong>{authState.email}</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-head">
            <span className="details-section-label">Payment Method</span>
            <span className="profile-section-note">Choose your default checkout option</span>
          </div>
          <div className="profile-method-list" role="radiogroup" aria-label="Payment method">
            {paymentMethods.map((method) => {
              const selected = method.id === selectedPaymentMethodId;

              return (
                <button
                  key={method.id}
                  type="button"
                  className={`profile-method-option ${selected ? "selected" : ""}`}
                  onClick={() => onSelectPaymentMethod(method.id)}
                  role="radio"
                  aria-checked={selected}
                >
                  <span className="profile-method-badge">{method.badge}</span>
                  <span className="profile-method-copy">
                    <strong>{method.type}</strong>
                    <span>{method.summary}</span>
                    <em>{method.detail}</em>
                  </span>
                  <span className="profile-method-indicator" aria-hidden="true">
                    {selected ? <CheckIcon /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="profile-footer">
        <button type="button" className="profile-logout-button" onClick={onSignOut}>
          Log out
        </button>
      </footer>
    </main>
  );
}
