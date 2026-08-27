import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPokemonDetails } from '../api/pokeApi';
import { capitalize } from '../utils/textUtils';

function PokemonCard({ pokemon, returnTo = '/pokedex' }) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPokemonDetails() {
      setError(false);

      try {
        const data = await getPokemonDetails(pokemon.name);

        if (!cancelled) {
          setPokemonDetails(data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    loadPokemonDetails();

    return () => {
      cancelled = true;
    };
  }, [pokemon.name, retryCount]);

  return (
    <div className="pokemon-card">
      {error ? (
        <div className="pokemon-card-status" role="alert">
          <p>Unable to load {capitalize(pokemon.name)}.</p>
          <button
            type="button"
            onClick={() => setRetryCount((currentCount) => currentCount + 1)}
          >
            Try again
          </button>
        </div>
      ) : pokemonDetails ? (
        <Link
          className="pokemon-card-link"
          to={`/pokemon/${pokemonDetails.name}`}
          state={{ returnTo }}
        >
          <img
            className="pokemon-image"
            src={
              pokemonDetails.sprites.front_default ||
              '/images/image-fallback.png'
            }
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
        </Link>
      ) : (
        <p className="pokemon-card-status" role="status">
          Loading...
        </p>
      )}
    </div>
  );
}

export default PokemonCard;
