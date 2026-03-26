import { useState } from "react";

function createInitialForms() {
  return {
    login: {
      email: "",
      password: ""
    },
    register: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  };
}

export default function AuthScreen({
  portal,
  mode,
  error,
  notice,
  onPortalChange,
  onModeChange,
  onLogin,
  onOwnerDemoBypass,
  onRegister,
  onVisitor
}) {
  const [forms, setForms] = useState(createInitialForms);
  const isOwnerPortal = portal === "owner";
  const ownerRegisterView = isOwnerPortal && mode === "register";

  const activeForm = forms[mode];

  const updateField = (field, value) => {
    setForms((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (ownerRegisterView) return;
    if (mode === "login") {
      await onLogin(forms.login);
      return;
    }
    await onRegister(forms.register);
  };

  return (
    <main className={`auth-screen ${isOwnerPortal ? "owner-theme" : ""}`}>
      <section className={`auth-card ${isOwnerPortal ? "owner-theme" : ""}`}>
        <div className={`auth-badge ${isOwnerPortal ? "owner-theme" : ""}`}>
          {isOwnerPortal ? "Truck Owner Portal" : "Campus Food Truck Demo"}
        </div>
        <h1>
          {isOwnerPortal
            ? mode === "login"
              ? "Truck owner sign in"
              : "Register your truck"
            : mode === "login"
              ? "Sign in to continue"
              : "Create your demo account"}
        </h1>
        <p className="auth-subtitle">
          {isOwnerPortal
            ? mode === "login"
              ? "Use your truck owner credentials to access the management portal preview."
              : "Truck owner accounts are created manually so we can verify your food truck information."
            : mode === "login"
              ? "Use your email and password to enter the prototype, or continue as a visitor."
              : "Registration is front-end only. Your demo account stays in local storage on this device."}
        </p>

        <div className="auth-portal-switch" role="tablist" aria-label="Account type">
          <button
            type="button"
            className={`auth-portal-button ${!isOwnerPortal ? "active" : ""}`}
            onClick={() => onPortalChange("user")}
            aria-pressed={!isOwnerPortal}
          >
            User
          </button>
          <button
            type="button"
            className={`auth-portal-button ${isOwnerPortal ? "active" : ""}`}
            onClick={() => onPortalChange("owner")}
            aria-pressed={isOwnerPortal}
          >
            Truck owner
          </button>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-toggle-button ${mode === "login" ? "active" : ""}`}
            onClick={() => onModeChange("login")}
            aria-pressed={mode === "login"}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-toggle-button ${mode === "register" ? "active" : ""}`}
            onClick={() => onModeChange("register")}
            aria-pressed={mode === "register"}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!ownerRegisterView && mode === "register" ? (
            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                value={activeForm.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </label>
          ) : null}

          {ownerRegisterView ? (
            <section className="auth-contact-card" aria-label="Truck owner registration">
              <strong>Contact us to register</strong>
              <p>
                Email us at{" "}
                <a className="auth-contact-link" href="mailto:9amdesigner@truck.com">
                  9amdesigner@truck.com
                </a>
                {" "}and we will help set up your truck owner account.
              </p>
            </section>
          ) : (
            <>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={activeForm.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder={isOwnerPortal ? "owner@truck.com" : "you@mail.utoronto.ca"}
                  autoComplete="email"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={activeForm.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>

              {mode === "register" ? (
                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    value={activeForm.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </label>
              ) : null}
            </>
          )}

          {error ? <div className="auth-message error">{error}</div> : null}
          {!error && notice ? <div className="auth-message notice">{notice}</div> : null}

          {!ownerRegisterView ? (
            <button type="submit" className="auth-primary-button">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          ) : (
            <button
              type="button"
              className="auth-primary-button"
              onClick={() => onModeChange("login")}
            >
              Back to owner login
            </button>
          )}

          {isOwnerPortal && mode === "login" ? (
            <button
              type="button"
              className="auth-secondary-button auth-owner-bypass-button"
              onClick={onOwnerDemoBypass}
            >
              Demo bypass as UT Little Pink Truck
            </button>
          ) : null}

          {mode === "login" ? (
            <>
              {!isOwnerPortal ? (
                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={onVisitor}
                >
                  Sign in as visitor
                </button>
              ) : null}
              <p className="auth-switch-copy">
                {isOwnerPortal ? "Need an owner account?" : "No account yet?"}{" "}
                <button type="button" className="auth-inline-link" onClick={() => onModeChange("register")}>
                  {isOwnerPortal ? "Register here" : "Register here"}
                </button>
              </p>
            </>
          ) : (
            <p className="auth-switch-copy">
              Already registered?{" "}
              <button type="button" className="auth-inline-link" onClick={() => onModeChange("login")}>
                Back to login
              </button>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
