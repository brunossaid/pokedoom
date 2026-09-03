function FavoritesFilters({ search, selectedRating, selectedTeam, searchDraft, ratingDraft, teamDraft, ratings, teams, showFilters, resultCount, onSearchDraftChange, onRatingDraftChange, onTeamDraftChange, onToggleFilters, onSubmit, onClear }) {
  return (
    <>
      <form className="search-area favorites-search-area" onSubmit={onSubmit}>
        <div className="search-row">
          <input
            type="search"
            className="search-bar"
            placeholder="Search Pokémon or custom tag..."
            aria-label="Search favorites by Pokémon name or custom tag"
            value={searchDraft}
            onChange={(event) => onSearchDraftChange(event.target.value)}
          />
          <button type="submit" className="search-submit-button">Search</button>
          <button
            type="button"
            className="filter-button"
            onClick={onToggleFilters}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            aria-expanded={showFilters}
            aria-controls="favorite-filters"
          >
            {showFilters ? '▴' : '▾'}
          </button>
        </div>
        <div id="favorite-filters" className={`filters-menu ${showFilters ? 'open' : ''}`}>
          <select aria-label="Filter by rating" value={ratingDraft} onChange={(event) => onRatingDraftChange(event.target.value)}>
            <option value="">All ratings</option>
            {ratings.map((rating) => <option value={rating} key={rating}>Rating = {rating}</option>)}
          </select>
          <select aria-label="Filter by team" value={teamDraft} onChange={(event) => onTeamDraftChange(event.target.value)}>
            <option value="">All teams</option>
            {teams.map((team) => <option value={team} key={team}>{team}</option>)}
          </select>
        </div>
      </form>
      <div className="results-summary" aria-live="polite">
        <strong>{resultCount} favorite{resultCount === 1 ? '' : 's'} found</strong>
        {(search || selectedRating || selectedTeam) && (
          <div className="applied-filters" aria-label="Applied filters">
            {search && <span>Search: {search}</span>}
            {selectedRating && <span>Rating: P{selectedRating}</span>}
            {selectedTeam && <span>Team: {selectedTeam}</span>}
            <button type="button" onClick={onClear}>Clear filters</button>
          </div>
        )}
      </div>
    </>
  );
}

export default FavoritesFilters;
