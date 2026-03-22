function highlightText(text, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return text;
  const index = text.toLowerCase().indexOf(normalized);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="search-highlight-mark">{text.slice(index, index + normalized.length)}</mark>
      {text.slice(index + normalized.length)}
    </>
  );
}

function SuggestionGroup({ title, items, onSelect, query }) {
  if (!items.length) return null;
  return (
    <section className="search-suggestion-group">
      <h4>{title}</h4>
      <div className="search-line-list">
        {items.map((item) => (
          <button
            key={`${title}:${item.value}`}
            type="button"
            className="search-line-item"
            onClick={() => onSelect(item.value)}
          >
            <span className="search-chip-title">{highlightText(item.label, query)}</span>
            {item.hint ? <span className="search-chip-hint">{item.hint}</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SearchAssistPanel({
  focused,
  query,
  totalResults,
  searchResults,
  groupedSuggestions,
  recentSearches,
  onSelectSuggestion,
  onSelectResult
}) {
  if (!focused) return null;

  const hasQuery = query.trim().length > 0;
  const noResult = hasQuery && totalResults === 0;

  return (
    <aside className="search-assist-panel" aria-live="polite">
      {!hasQuery ? (
        <>
          <section className="search-suggestion-group">
            <h4>Quick Filters</h4>
            <div className="search-chip-grid">
              {[
                "open now",
                "under 15 min",
                "under $15",
                "vegetarian",
                "halal",
                "drinks"
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  className="search-quick-chip"
                  onClick={() => onSelectSuggestion(term)}
                >
                  <span className="search-chip-title">{term}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="search-suggestion-group">
            <h4>Recent</h4>
            <div className="search-chip-grid">
              {recentSearches.map((entry) => (
                <button
                  key={`${entry.kind}:${entry.label}`}
                  type="button"
                  className="search-quick-chip muted"
                  onClick={() => onSelectSuggestion(entry.label)}
                >
                  <span className="search-chip-title">{entry.label}</span>
                  <span className="search-chip-kind">
                    {entry.kind === "entity" ? "Viewed" : "Recent"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {hasQuery ? (
        <>
          <div className="search-result-summary">
            {totalResults > 0
              ? `${totalResults} match${totalResults > 1 ? "es" : ""} near UofT St. George`
              : "No matching trucks right now"}
          </div>
          {noResult ? (
            <div className="search-empty-state">
              <p>No trucks found for "{query.trim()}".</p>
              <div className="search-empty-options">
                {["bubble tea", "fried chicken", "cheap lunch", "open now"].map((term) => (
                  <button key={term} type="button" onClick={() => onSelectSuggestion(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <section className="search-suggestion-group">
                <h4>Top Results</h4>
                <div className="search-result-list">
                  {searchResults.slice(0, 5).map((truck) => (
                    <button
                      key={truck.id}
                      type="button"
                      className="search-result-row"
                      onClick={() => onSelectResult(truck.id)}
                    >
                      <span className="search-result-main">
                        <strong>{highlightText(truck.name, query)}</strong>
                        <em>{highlightText(truck.cuisine, query)}</em>
                      </span>
                      <span className="search-result-meta">
                        {truck.waitTimeMin}m wait · {truck.walkTimeMin}m walk
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <SuggestionGroup
                title="Trucks"
                items={groupedSuggestions.trucks}
                onSelect={onSelectSuggestion}
                query={query}
              />
              <SuggestionGroup
                title="Foods"
                items={groupedSuggestions.foods}
                onSelect={onSelectSuggestion}
                query={query}
              />
              <SuggestionGroup
                title="Categories"
                items={groupedSuggestions.categories}
                onSelect={onSelectSuggestion}
                query={query}
              />
            </>
          )}
        </>
      ) : null}
    </aside>
  );
}
