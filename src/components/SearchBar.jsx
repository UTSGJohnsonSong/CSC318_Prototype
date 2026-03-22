export default function SearchBar({ sortVisible, onToggleSort }) {
  return (
    <div className="search-wrap">
      <div className="search-field" role="search">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="search-placeholder">Search food trucks or food</span>
        <button
          type="button"
          className={`filter-icon-button ${sortVisible ? "active" : ""}`}
          onClick={onToggleSort}
          aria-label={sortVisible ? "Hide sorting options" : "Show sorting options"}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M7 12H17M10 17H14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
