import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPokemonDetails } from '../api/pokeApi';
import { formatPokemonName } from '../utils/textUtils';
import { handleImageError } from '../utils/imageFallback';
import { ErrorState, LoadingState } from './AsyncState';

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
        <ErrorState
          className="pokemon-card-status"
          message={`Unable to load ${formatPokemonName(pokemon.name)}.`}
          onRetry={() => setRetryCount((currentCount) => currentCount + 1)}
        />
      ) : pokemonDetails ? (
        <Link
          className="pokemon-card-link"
          to={`/pokemon/${pokemonDetails.name}`}
          state={{ returnTo }}
        >
          <img
            className="pokemon-image"
            onError={handleImageError}
            src={
              pokemonDetails.sprites.other?.showdown?.front_default ||
              pokemonDetails.sprites.other?.['official-artwork']
                ?.front_default ||
              pokemonDetails.sprites.front_default ||
              '/images/image-fallback.png'
            }
            alt={pokemonDetails.name}
          />

          <span className="pokemon-number">#{pokemonDetails.id}</span>

          <h3 className="pokemon-name">{formatPokemonName(pokemon.name)}</h3>
        </Link>
      ) : (
        <LoadingState
          className="pokemon-card-status"
          label={`Loading ${pokemon.name}`}
        />
      )}
    </div>
  );
}

export default PokemonCard;
