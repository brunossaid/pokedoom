import { fetchJson, POKE_API_BASE_URL } from './apiClient';

export const getPokemonList = (limit = 24, offset = 0) =>
  fetchJson(
    `${POKE_API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    'Failed to fetch Pokémon list'
  );

export const getAllPokemon = () =>
  fetchJson(
    `${POKE_API_BASE_URL}/pokemon?limit=2000&offset=0`,
    'Failed to fetch all Pokémon'
  );

export const getPokemonDetails = (name) =>
  fetchJson(
    `${POKE_API_BASE_URL}/pokemon/${encodeURIComponent(name)}`,
    'Failed to fetch Pokémon details'
  );

export const getPokemonSpecies = (name) =>
  fetchJson(
    `${POKE_API_BASE_URL}/pokemon-species/${encodeURIComponent(name)}`,
    'Failed to fetch Pokémon species'
  );

export async function getPokemonForms(forms = []) {
  if (forms.length <= 1) return [];
  return Promise.all(
    forms.map(async ({ name, url }) => {
      const form = await fetchJson(url, 'Failed to fetch Pokémon form');
      return {
        name,
        label: form.form_name || name,
        image: form.sprites.front_default || '/images/image-fallback.png',
        shinyImage: form.sprites.front_shiny,
      };
    })
  );
}
