import { useEffect, useState } from 'react';
import { getPokemonList } from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';

function Pokedex() {
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    async function loadPokemon() {
      const data = await getPokemonList();
      setPokemonList(data.results);
    }

    loadPokemon();
  }, []);

  return (
    <>
      <div className="pokemon-grid">
        {pokemonList.map((pokemon) => (
          <PokemonCard key={pokemon.name} pokemon={pokemon} />
        ))}
      </div>
    </>
  );
}

export default Pokedex;
