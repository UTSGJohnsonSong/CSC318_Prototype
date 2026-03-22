const sortOptions = [
  "Fastest",
  "Closest",
  "Shortest Wait",
  "Recommended"
];

export default function SortDropdown({ currentSort, onSelect }) {
  return (
    <div className="sort-control segmented">
      <div className="sort-segmented-wrap" role="tablist" aria-label="Sort options">
        {sortOptions.map((option) => (
          <button
            type="button"
            role="tab"
            aria-selected={option === currentSort}
            key={option}
            className={`sort-segment ${option === currentSort ? "active" : ""}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
