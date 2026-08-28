import { useCallback, useEffect, useState } from 'react';
import { getPokemonDetails, getPokemonSpecies } from '../api/pokeApi';

export function useRandomPokemon() {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const randomId = Math.floor(Math.random() * 1025) + 1;

        // Solicita ambos recursos a la vez para mostrar la tarjeta destacada lo antes posible.
        const [pokemonData, speciesData] = await Promise.all([
          getPokemonDetails(randomId),
          getPokemonSpecies(randomId),
        ]);

        if (!cancelled) {
          setPokemon(pokemonData);
          setSpecies(speciesData);
        }
      } catch {
        if (!cancelled) {
          setPokemon(null);
          setSpecies(null);
          setError('Unable to discover a Pokémon. Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);
  return { pokemon, species, loading, error, retry };
}
