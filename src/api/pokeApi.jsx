const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemonList(limit = 24, offset = 0) {
  const response = await fetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list');
  }

  return response.json();
}

export async function getAllPokemon() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=2000&offset=0`);

  if (!response.ok) {
    throw new Error('Failed to fetch all Pokémon');
  }

  return response.json();
}

export async function getPokemonByType(type) {
  const response = await fetch(`${BASE_URL}/type/${type}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon by type');
  }

  return response.json();
}

export async function getPokemonByGeneration(generation) {
  const response = await fetch(`${BASE_URL}/generation/${generation}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon by generation');
  }

  return response.json();
}

export async function getPokemonDetails(name) {
  const response = await fetch(`${BASE_URL}/pokemon/${name}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon details');
  }

  return response.json();
}

export async function getTypes() {
  const response = await fetch(`${BASE_URL}/type`);

  if (!response.ok) {
    throw new Error('Failed to fetch types');
  }

  return response.json();
}

export async function getRegions() {
  const response = await fetch(`${BASE_URL}/region`);

  if (!response.ok) {
    throw new Error('Failed to fetch regions');
  }

  return response.json();
}
