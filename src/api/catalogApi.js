import { fetchJson, POKE_API_BASE_URL } from './apiClient';

const REGION_GENERATION_FALLBACKS = { hisui: 8, orre: 3 };

export const getPokemonByType = (type) =>
  fetchJson(`${POKE_API_BASE_URL}/type/${encodeURIComponent(type)}`, 'Failed to fetch Pokémon by type');

export async function getPokemonByRegion(region) {
  const regionData = await fetchJson(`${POKE_API_BASE_URL}/region/${encodeURIComponent(region)}`, 'Failed to fetch Pokémon region');
  const fallback = REGION_GENERATION_FALLBACKS[region];
  const generationUrl = regionData.main_generation?.url || (fallback ? `${POKE_API_BASE_URL}/generation/${fallback}` : null);
  return generationUrl ? fetchJson(generationUrl, 'Failed to fetch the region generation') : { pokemon_species: [] };
}

export const getTypes = () => fetchJson(`${POKE_API_BASE_URL}/type`, 'Failed to fetch types');
export const getRegions = () => fetchJson(`${POKE_API_BASE_URL}/region`, 'Failed to fetch regions');
