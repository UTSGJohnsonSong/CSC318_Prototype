export default function SearchBar({
  value,
  focused,
  onFocus,
  onChange,
  onSubmit,
  onClear,
  onCancel,
  sortVisible,
  onToggleSort
}) {
  return (
    <div className={`search-wrap ${focused ? "focused" : ""}`}>
      <div className="search-field" role="search">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          className="search-input"
          value={value}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit(event.currentTarget.value);
            }
          }}
          placeholder="Search food or trucks"
          aria-label="Search food trucks or food"
        />
        {value ? (
          <button
            type="button"
            className="search-clear-button"
            onClick={onClear}
            aria-label="Clear search"
          >
            <span className="search-clear-glyph">×</span>
          </button>
        ) : null}
        {focused ? (
          <button type="button" className="search-inline-cancel" onClick={onCancel}>
            Cancel
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
