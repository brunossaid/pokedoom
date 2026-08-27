import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getAllPokemon,
  getPokemonByRegion,
  getPokemonByType,
  getPokemonList,
  getRegions,
  getTypes,
} from '../api/pokeApi';
import { POKEMON_PER_PAGE, usePokemonSearch } from './usePokemonSearch';
const read = (params, key) => params.get(key) || '';

export function usePokedexController() {
  const [params, setParams] = useSearchParams();
  const [pokemonList, setPokemonList] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [totalPokemon, setTotalPokemon] = useState(0);
  const [page, setPage] = useState(() =>
    Math.max(1, Number.parseInt(params.get('page'), 10) || 1)
  );
  const [search, setSearch] = useState(() => read(params, 'search'));
  const [searchDraft, setSearchDraft] = useState(() => read(params, 'search'));
  const [selectedType, setSelectedType] = useState(() => read(params, 'type'));
  const [typeDraft, setTypeDraft] = useState(() => read(params, 'type'));
  const [selectedRegion, setSelectedRegion] = useState(() =>
    read(params, 'region')
  );
  const [regionDraft, setRegionDraft] = useState(() => read(params, 'region'));
  const [typePokemon, setTypePokemon] = useState([]);
  const [regionPokemon, setRegionPokemon] = useState([]);
  const [types, setTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [regionLoading, setRegionLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showFilters, setShowFilters] = useState(() =>
    Boolean(read(params, 'type') || read(params, 'region'))
  );
  const result = usePokemonSearch({
    allPokemon,
    pokemonList,
    search,
    selectedType,
    selectedRegion,
    typePokemon,
    regionPokemon,
    page,
    totalPokemon,
  });
  const updateParams = (next, replace = false) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, item]) =>
      item && item !== 1 ? updated.set(key, String(item)) : updated.delete(key)
    );
    setParams(updated, { replace });
  };
  const changePage = (next) => {
    setPage(next);
    updateParams({ page: next });
  };
  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchDraft);
    setSelectedType(typeDraft);
    setSelectedRegion(regionDraft);
    setPage(1);
    updateParams(
      { search: searchDraft, type: typeDraft, region: regionDraft, page: 1 },
      true
    );
  };
  const clearFilters = () => {
    setSearch('');
    setSearchDraft('');
    setSelectedType('');
    setTypeDraft('');
    setSelectedRegion('');
    setRegionDraft('');
    setTypePokemon([]);
    setRegionPokemon([]);
    setPage(1);
    setParams({}, { replace: true });
  };
  useEffect(() => {
    const sync = () => {
      const current = new URLSearchParams(window.location.search),
        nextSearch = read(current, 'search'),
        nextType = read(current, 'type'),
        nextRegion = read(current, 'region');
      setPage(Math.max(1, Number.parseInt(current.get('page'), 10) || 1));
      setSearch(nextSearch);
      setSearchDraft(nextSearch);
      setSelectedType(nextType);
      setTypeDraft(nextType);
      setSelectedRegion(nextRegion);
      setRegionDraft(nextRegion);
      setShowFilters(Boolean(nextType || nextRegion));
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getPokemonList(POKEMON_PER_PAGE, result.offset);
        if (!cancelled) {
          setPokemonList(data.results);
          setTotalPokemon(data.count);
        }
      } catch {
        if (!cancelled)
          setError(
            'Unable to load Pokémon. Please check your connection and try again.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [result.offset, retryCount]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllPokemon(), getTypes(), getRegions()])
      .then(([pokemon, typeData, regionData]) => {
        if (!cancelled) {
          setAllPokemon(pokemon.results);
          setTypes(typeData.results);
          setRegions(regionData.results);
        }
      })
      .catch(() => {
        if (!cancelled)
          setError('Unable to load search filters. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);
  useEffect(() => {
    let cancelled = false;
    if (!selectedType) return undefined;
    async function loadType() {
      setTypeLoading(true);
      try {
        const data = await getPokemonByType(selectedType);
        if (!cancelled)
          setTypePokemon(data.pokemon.map(({ pokemon }) => pokemon));
      } catch {
        if (!cancelled)
          setError('Unable to filter Pokémon by type. Please try again.');
      } finally {
        if (!cancelled) setTypeLoading(false);
      }
    }
    loadType();
    return () => {
      cancelled = true;
    };
  }, [selectedType, retryCount]);
  useEffect(() => {
    let cancelled = false;
    if (!selectedRegion) return undefined;
    async function loadRegion() {
      setRegionLoading(true);
      try {
        const data = await getPokemonByRegion(selectedRegion);
        if (!cancelled) setRegionPokemon(data.pokemon_species);
      } catch {
        if (!cancelled)
          setError('Unable to filter Pokémon by region. Please try again.');
      } finally {
        if (!cancelled) setRegionLoading(false);
      }
    }
    loadRegion();
    return () => {
      cancelled = true;
    };
  }, [selectedRegion, retryCount]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);
  return {
    ...result,
    params,
    page,
    search,
    searchDraft,
    typeDraft,
    regionDraft,
    selectedType,
    selectedRegion,
    types,
    regions,
    loading,
    filtersLoading: typeLoading || regionLoading,
    error,
    showFilters,
    setSearchDraft,
    setTypeDraft,
    setRegionDraft,
    setShowFilters,
    submitSearch,
    clearFilters,
    changePage,
    retry: () => setRetryCount((count) => count + 1),
  };
}
