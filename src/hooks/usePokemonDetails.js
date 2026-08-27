import { useEffect, useState } from 'react';
import {
  getPokemonDefenses,
  getPokemonDetails,
  getPokemonEvolutionFamily,
  getPokemonSpecies,
} from '../api/pokeApi';
import { recordPokemonView } from '../services/historyStorage';

export function usePokemonDetails(name) {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [selectedAppearance, setSelectedAppearance] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [specialForms, setSpecialForms] = useState([]);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [evolutionError, setEvolutionError] = useState('');
  const [evolutionRetryCount, setEvolutionRetryCount] = useState(0);
  const [defenses, setDefenses] = useState([]);
  const [defensesLoading, setDefensesLoading] = useState(false);
  const [defensesError, setDefensesError] = useState('');
  const [defensesRetryCount, setDefensesRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPokemon() {
      setLoading(true);
      setError('');

      try {
        const data = await getPokemonDetails(name);
        const speciesData = await getPokemonSpecies(data.species.name);

        if (!cancelled) {
          setPokemon(data);
          setSpecies(speciesData);
          setSelectedAppearance('default');
          recordPokemonView(data);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load this Pokémon. Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPokemon();
    return () => { cancelled = true; };
  }, [name, retryCount]);

  useEffect(() => {
    if (!pokemon?.species.name) return undefined;
    let cancelled = false;

    async function loadEvolutionChain() {
      setEvolutionLoading(true);
      setEvolutionError('');
      try {
        const data = await getPokemonEvolutionFamily(pokemon.species.name);
        if (!cancelled) {
          setEvolutionChain(data.chain);
          setSpecialForms(data.specialForms);
        }
      } catch {
        if (!cancelled) setEvolutionError('Unable to load the evolution chain.');
      } finally {
        if (!cancelled) setEvolutionLoading(false);
      }
    }

    loadEvolutionChain();
    return () => { cancelled = true; };
  }, [pokemon?.species.name, evolutionRetryCount]);

  const typeNames = pokemon?.types.map(({ type }) => type.name).join(',') || '';

  useEffect(() => {
    if (!typeNames) return undefined;
    let cancelled = false;

    async function loadDefenses() {
      setDefensesLoading(true);
      setDefensesError('');
      try {
        const data = await getPokemonDefenses(typeNames.split(','));
        if (!cancelled) setDefenses(data);
      } catch {
        if (!cancelled) setDefensesError('Unable to load type effectiveness.');
      } finally {
        if (!cancelled) setDefensesLoading(false);
      }
    }

    loadDefenses();
    return () => { cancelled = true; };
  }, [typeNames, defensesRetryCount]);

  return {
    pokemon,
    species,
    selectedAppearance,
    setSelectedAppearance,
    loading,
    error,
    retryPokemon: () => setRetryCount((count) => count + 1),
    evolutionChain,
    specialForms,
    evolutionLoading,
    evolutionError,
    retryEvolution: () => setEvolutionRetryCount((count) => count + 1),
    defenses,
    defensesLoading,
    defensesError,
    retryDefenses: () => setDefensesRetryCount((count) => count + 1),
  };
}
