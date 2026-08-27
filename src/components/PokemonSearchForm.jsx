import { capitalize } from '../utils/textUtils';

function PokemonSearchForm({
  searchDraft, typeDraft, regionDraft, types, regions, showFilters,
  loading, onSearchChange, onTypeChange, onRegionChange, onToggleFilters, onSubmit,
}) {
  return (
    <form className="search-area" onSubmit={onSubmit}>
      <div className="search-row">
        <input type="search" className="search-bar" placeholder="Search Pokémon..."
          aria-label="Search Pokémon" value={searchDraft} onChange={(event) => onSearchChange(event.target.value)} />
        <button type="submit" className="search-submit-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button type="button" className="filter-button" onClick={onToggleFilters}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'} aria-expanded={showFilters}
          aria-controls="pokemon-filters">
          {showFilters ? '▴' : '▾'}
        </button>
      </div>
      <div id="pokemon-filters" className={`filters-menu ${showFilters ? 'open' : ''}`}>
        <select aria-label="Filter by type" value={typeDraft} onChange={(event) => onTypeChange(event.target.value)}>
          <option value="">Any type</option>
          {types.filter(({ name }) => !['unknown', 'stellar'].includes(name)).map(({ name }) => (
            <option key={name} value={name}>{capitalize(name)}</option>
          ))}
        </select>
        <select aria-label="Filter by region" value={regionDraft} onChange={(event) => onRegionChange(event.target.value)}>
          <option value="">All regions</option>
          {regions.map(({ name }) => <option key={name} value={name}>{capitalize(name)}</option>)}
        </select>
      </div>
    </form>
  );
}

export default PokemonSearchForm;
