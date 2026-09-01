const POKEMON_PER_PAGE = 10;

export function usePokemonSearch({ allPokemon, pokemonList, search, selectedType, selectedRegion, typePokemon, regionPokemon, page, totalPokemon }) {
  const filteredPokemon = allPokemon.filter(({ name }) => {
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || typePokemon.some((pokemon) => pokemon.name === name);
    const matchesRegion =
      !selectedRegion ||
      name.includes(`-${selectedRegion}`) ||
      regionPokemon.some((pokemon) => pokemon.name === name);
    return matchesSearch && matchesType && matchesRegion;
  });
  const hasFilters = Boolean(search || selectedType || selectedRegion);
  const offset = (page - 1) * POKEMON_PER_PAGE;
  const pokemonToShow = hasFilters ? filteredPokemon.slice(offset, offset + POKEMON_PER_PAGE) : pokemonList;
  const totalPages = Math.max(1, Math.ceil((hasFilters ? filteredPokemon.length : totalPokemon) / POKEMON_PER_PAGE));
  return { offset, pokemonToShow, totalPages, hasFilters, resultCount: hasFilters ? filteredPokemon.length : totalPokemon };
}

export { POKEMON_PER_PAGE };
