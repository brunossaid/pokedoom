export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchJson(url, errorMessage) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}
