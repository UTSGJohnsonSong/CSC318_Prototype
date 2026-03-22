export default function MobileShell({ children }) {
  return (
    <div className="desktop-stage">
      <div className="iphone-shell">
        <div className="app-screen">
          <div className="ios-statusbar-spacer" aria-hidden="true" />
          <div className="dynamic-island" aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  );
}
