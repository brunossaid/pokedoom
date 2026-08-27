import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getPokemonList,
  getAllPokemon,
  getPokemonByType,
  getPokemonByRegion,
  getTypes,
  getRegions,
} from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { capitalize } from '../utils/textUtils';

const POKEMON_PER_PAGE = 10;

function Pokedex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemonList, setPokemonList] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);

  const [page, setPage] = useState(() =>
    Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)
  );
  const [totalPokemon, setTotalPokemon] = useState(0);

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [searchDraft, setSearchDraft] = useState(
    () => searchParams.get('search') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const offset = (page - 1) * POKEMON_PER_PAGE;

  const [selectedType, setSelectedType] = useState(
    () => searchParams.get('type') || ''
  );
  const [selectedRegion, setSelectedRegion] = useState(
    () => searchParams.get('region') || ''
  );
  const [typeDraft, setTypeDraft] = useState(
    () => searchParams.get('type') || ''
  );
  const [regionDraft, setRegionDraft] = useState(
    () => searchParams.get('region') || ''
  );
  const [typePokemon, setTypePokemon] = useState([]);
  const [regionPokemon, setRegionPokemon] = useState([]);
  const [typeFilterLoading, setTypeFilterLoading] = useState(false);
  const [regionFilterLoading, setRegionFilterLoading] = useState(false);

  const filteredPokemon = allPokemon.filter((pokemon) => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      !selectedType || typePokemon.some((p) => p.name === pokemon.name);

    const matchesRegion =
      !selectedRegion || regionPokemon.some((p) => p.name === pokemon.name);

    return matchesSearch && matchesType && matchesRegion;
  });

  const hasFilters = search || selectedType || selectedRegion;

  const pokemonToShow = hasFilters
    ? filteredPokemon.slice(offset, offset + POKEMON_PER_PAGE)
    : pokemonList;

  const totalPages = Math.max(
    1,
    hasFilters
      ? Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE)
      : Math.ceil(totalPokemon / POKEMON_PER_PAGE)
  );
  const filtersLoading = typeFilterLoading || regionFilterLoading;
  const resultCount = hasFilters ? filteredPokemon.length : totalPokemon;

  const [showFilters, setShowFilters] = useState(
    () => Boolean(searchParams.get('type') || searchParams.get('region'))
  );

  const [types, setTypes] = useState([]);
  const [regions, setRegions] = useState([]);

  function updateView(nextValues, replace = false) {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value && value !== 1) nextParams.set(key, String(value));
      else nextParams.delete(key);
    });

    setSearchParams(nextParams, { replace });
  }

  function changePage(nextPage) {
    setPage(nextPage);
    updateView({ page: nextPage });
  }

  function submitSearch(event) {
    event.preventDefault();
    setTypeFilterLoading(Boolean(typeDraft && typeDraft !== selectedType));
    setRegionFilterLoading(Boolean(regionDraft && regionDraft !== selectedRegion));
    setSearch(searchDraft);
    setSelectedType(typeDraft);
    setSelectedRegion(regionDraft);
    setPage(1);
    updateView(
      { search: searchDraft, type: typeDraft, region: regionDraft, page: 1 },
      true
    );
  }

  function clearFilters() {
    setSearch('');
    setSearchDraft('');
    setSelectedType('');
    setTypeDraft('');
    setSelectedRegion('');
    setRegionDraft('');
    setTypePokemon([]);
    setRegionPokemon([]);
    setTypeFilterLoading(false);
    setRegionFilterLoading(false);
    setPage(1);
    setSearchParams({}, { replace: true });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPokemon() {
      setLoading(true);
      setError('');

      try {
        const data = await getPokemonList(POKEMON_PER_PAGE, offset);

        if (!cancelled) {
          setPokemonList(data.results);
          setTotalPokemon(data.count);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load Pokémon. Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      cancelled = true;
    };
  }, [offset, retryCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadFiltersData() {
      try {
        const [pokemonData, typesData, regionsData] = await Promise.all([
          getAllPokemon(),
          getTypes(),
          getRegions(),
        ]);

        if (!cancelled) {
          setAllPokemon(pokemonData.results);
          setTypes(typesData.results);
          setRegions(regionsData.results);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load search filters. Please try again.');
        }
      }
    }

    loadFiltersData();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadTypeFilter() {
      if (!selectedType) {
        setTypePokemon([]);
        setTypeFilterLoading(false);
        return;
      }

      setTypeFilterLoading(true);
      try {
        const data = await getPokemonByType(selectedType);

        if (!cancelled) {
          setTypePokemon(data.pokemon.map((item) => item.pokemon));
        }
      } catch {
        if (!cancelled) {
          setError('Unable to filter Pokémon by type. Please try again.');
        }
      } finally {
        if (!cancelled) setTypeFilterLoading(false);
      }
    }

    loadTypeFilter();

    return () => {
      cancelled = true;
    };
  }, [selectedType, retryCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegionFilter() {
      if (!selectedRegion) {
        setRegionPokemon([]);
        setRegionFilterLoading(false);
        return;
      }

      setRegionFilterLoading(true);
      try {
        const data = await getPokemonByRegion(selectedRegion);

        if (!cancelled) {
          setRegionPokemon(data.pokemon_species);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to filter Pokémon by region. Please try again.');
        }
      } finally {
        if (!cancelled) setRegionFilterLoading(false);
      }
    }

    loadRegionFilter();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion, retryCount]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [page]);

  return (
    <>
      {loading ? (
        <div className="loading-dots" role="status" aria-label="Loading Pokémon">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      ) : error ? (
        <div className="error-state" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((currentCount) => currentCount + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="pokedex-container">
          <form className="search-area" onSubmit={submitSearch}>
            <div className="search-row">
              <input
                type="search"
                className="search-bar"
                placeholder="Search Pokémon..."
                aria-label="Search Pokémon"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />

              <button
                type="submit"
                className="search-submit-button"
                disabled={filtersLoading}
              >
                {filtersLoading ? 'Searching...' : 'Search'}
              </button>

              <button
                type="button"
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                aria-expanded={showFilters}
                aria-controls="pokemon-filters"
              >
                {showFilters ? '▴' : '▾'}
              </button>
            </div>

            <div
              id="pokemon-filters"
              className={`filters-menu ${showFilters ? 'open' : ''}`}
            >
              <select
                aria-label="Filter by type"
                value={typeDraft}
                onChange={(e) => setTypeDraft(e.target.value)}
              >
                <option value="">Any type</option>
                {types
                  .filter((type) => !['unknown', 'stellar'].includes(type.name))
                  .map((type) => (
                    <option key={type.name} value={type.name}>
                      {capitalize(type.name)}
                    </option>
                  ))}
              </select>

              <select
                aria-label="Filter by region"
                value={regionDraft}
                onChange={(e) => setRegionDraft(e.target.value)}
              >
                <option value="">All regions</option>
                {regions.map((region) => (
                  <option key={region.name} value={region.name}>
                    {capitalize(region.name)}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="results-summary" aria-live="polite">
            <strong>{filtersLoading ? 'Applying filters...' : `${resultCount} Pokémon found`}</strong>
            {hasFilters && !filtersLoading && (
              <div className="applied-filters" aria-label="Applied filters">
                {search && <span>Name: {search}</span>}
                {selectedType && <span>Type: {capitalize(selectedType)}</span>}
                {selectedRegion && <span>Region: {capitalize(selectedRegion)}</span>}
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>

          {filtersLoading ? (
            <div className="filter-loading" role="status">
              <span>.</span><span>.</span><span>.</span>
              <p>Searching Pokémon...</p>
            </div>
          ) : pokemonToShow.length > 0 ? (
            <div className="pokemon-grid">
              {pokemonToShow.map((pokemon) => (
                <PokemonCard
                  key={pokemon.name}
                  pokemon={pokemon}
                  returnTo={`/pokedex${searchParams.size ? `?${searchParams}` : ''}`}
                />
              ))}
            </div>
          ) : (
            <p className="empty-results" role="status">
              No Pokémon found. Try changing your search or filters.
            </p>
          )}

          <nav className="pagination" aria-label="Pokémon list pagination">
            <button
              type="button"
              onClick={() => changePage(1)}
              disabled={page === 1}
              aria-label="Go to first page"
            >
              «
            </button>

            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              aria-label="Go to previous page"
            >
              ‹
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Go to next page"
            >
              ›
            </button>

            <button
              type="button"
              onClick={() => changePage(totalPages)}
              disabled={page >= totalPages}
              aria-label="Go to last page"
            >
              »
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

export default Pokedex;
