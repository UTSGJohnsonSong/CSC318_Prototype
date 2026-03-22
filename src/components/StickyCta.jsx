export default function StickyCta({ truck }) {
  if (!truck) return null;

  return (
    <div className="sticky-cta-wrap">
      <button type="button" className="sticky-cta">
        View {truck.name}
      </button>
    </div>
  );
}
