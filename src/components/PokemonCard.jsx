import { useEffect, useState } from 'react';
import { getPokemonDetails } from '../api/pokeApi';
import { capitalize } from '../utils/textUtils';

function PokemonCard({ pokemon }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);

  useEffect(() => {
    async function loadPokemonDetails() {
      const data = await getPokemonDetails(pokemon.name);
      setPokemonDetails(data);
    }

    loadPokemonDetails();
  }, [pokemon.name]);

  return (
    <div className="pokemon-card">
      {pokemonDetails && (
        <>
          <img
            className="pokemon-image"
            src={pokemonDetails.sprites.front_default}
            alt={pokemonDetails.name}
          />

          <span className="pokemon-number">#{pokemonDetails.id}</span>

          <h3 className="pokemon-name">{capitalize(pokemonDetails.name)}</h3>

          {/**  
          <div>
            {pokemonDetails.types.map((type) => (
              <span key={type.type.name}>{type.type.name}</span>
            ))}
          </div>
          */}
        </>
      )}
    </div>
  );
}

export default PokemonCard;
