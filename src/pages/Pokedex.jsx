import { useEffect, useState } from 'react';
import {
  getPokemonList,
  getAllPokemon,
  getPokemonByType,
  getPokemonByGeneration,
  getTypes,
  getRegions,
} from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { capitalize } from '../utils/textUtils';

function getPokemonLimit() {
  const width = window.innerWidth;

  if (width >= 1024) return 54;
  if (width >= 768) return 44;

  return 36;
}

function Pokedex() {
  const [pokemonList, setPokemonList] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);

  const [limit, setLimit] = useState(getPokemonLimit());
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(0);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const offset = (page - 1) * limit;

  const [selectedType, setSelectedType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [typePokemon, setTypePokemon] = useState([]);
  const [regionPokemon, setRegionPokemon] = useState([]);

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
    ? filteredPokemon.slice(offset, offset + limit)
    : pokemonList;

  const totalPages = hasFilters
    ? Math.ceil(filteredPokemon.length / limit)
    : Math.ceil(totalPokemon / limit);

  const [showFilters, setShowFilters] = useState(false);

  const [types, setTypes] = useState([]);
  const [regions, setRegions] = useState([]);

  const regionGenerationMap = {
    kanto: 1,
    johto: 2,
    hoenn: 3,
    sinnoh: 4,
    unova: 5,
    kalos: 6,
    alola: 7,
    galar: 8,
    paldea: 9,
  };

  useEffect(() => {
    async function loadPokemon() {
      setLoading(true);

      const data = await getPokemonList(limit, offset);

      setPokemonList(data.results);
      setTotalPokemon(data.count);

      setLoading(false);
    }

    loadPokemon();
  }, [limit, offset]);

  useEffect(() => {
    async function loadFiltersData() {
      const pokemonData = await getAllPokemon();
      const typesData = await getTypes();
      const regionsData = await getRegions();

      setAllPokemon(pokemonData.results);
      setTypes(typesData.results);
      setRegions(regionsData.results);
    }

    loadFiltersData();
  }, []);

  useEffect(() => {
    async function loadTypeFilter() {
      if (!selectedType) {
        setTypePokemon([]);
        return;
      }

      const data = await getPokemonByType(selectedType);

      setTypePokemon(data.pokemon.map((item) => item.pokemon));
    }

    loadTypeFilter();
  }, [selectedType]);

  useEffect(() => {
    async function loadRegionFilter() {
      if (!selectedRegion) {
        setRegionPokemon([]);
        return;
      }

      const generation = regionGenerationMap[selectedRegion];

      const data = await getPokemonByGeneration(generation);

      setRegionPokemon(data.pokemon_species);
    }

    loadRegionFilter();
  }, [selectedRegion]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [page]);

  return (
    <>
      {loading ? (
        <div className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      ) : (
        <div className="pokedex-container">
          <div className="search-area">
            <div className="search-row">
              <input
                className="search-bar"
                placeholder="Search Pokémon..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />

              <button
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? '▴' : '▾'}
              </button>
            </div>

            <div className={`filters-menu ${showFilters ? 'open' : ''}`}>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
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
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All regions</option>
                {regions.map((region) => (
                  <option key={region.name} value={region.name}>
                    {capitalize(region.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pokemon-grid">
            {pokemonToShow.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>
              «
            </button>

            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ‹
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              ›
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Pokedex;
