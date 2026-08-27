import PokemonCard from '../components/PokemonCard';
import Pagination from '../components/Pagination';
import PokemonSearchForm from '../components/PokemonSearchForm';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { usePokedexController } from '../hooks/usePokedexController';
import { capitalize } from '../utils/textUtils';

function Pokedex() {
  const state = usePokedexController();
  if (state.loading) return <LoadingState label="Loading Pokémon" />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.retry} />;
  return <div className="pokedex-container">
    <PokemonSearchForm searchDraft={state.searchDraft} typeDraft={state.typeDraft} regionDraft={state.regionDraft}
      types={state.types} regions={state.regions} showFilters={state.showFilters} loading={state.filtersLoading}
      onSearchChange={state.setSearchDraft} onTypeChange={state.setTypeDraft} onRegionChange={state.setRegionDraft}
      onToggleFilters={() => state.setShowFilters((visible) => !visible)} onSubmit={state.submitSearch} />
    <div className="results-summary" aria-live="polite">
      <strong>{state.filtersLoading ? 'Applying filters...' : `${state.resultCount} Pokémon found`}</strong>
      {state.hasFilters && !state.filtersLoading && <div className="applied-filters" aria-label="Applied filters">
        {state.search && <span>Name: {state.search}</span>}
        {state.selectedType && <span>Type: {capitalize(state.selectedType)}</span>}
        {state.selectedRegion && <span>Region: {capitalize(state.selectedRegion)}</span>}
        <button type="button" onClick={state.clearFilters}>Clear filters</button>
      </div>}
    </div>
    {state.filtersLoading ? <div className="filter-loading" role="status"><span>.</span><span>.</span><span>.</span><p>Searching Pokémon...</p></div>
      : state.pokemonToShow.length ? <div className="pokemon-grid">{state.pokemonToShow.map((pokemon) =>
        <PokemonCard key={pokemon.name} pokemon={pokemon} returnTo={`/pokedex${state.params.size ? `?${state.params}` : ''}`} />)}</div>
        : <p className="empty-results" role="status">No Pokémon found. Try changing your search or filters.</p>}
    <Pagination page={state.page} totalPages={state.totalPages} onChange={state.changePage} label="Pokémon list pagination" />
  </div>;
}

export default Pokedex;
