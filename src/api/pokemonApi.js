import { fetchJson, POKE_API_BASE_URL } from './apiClient';

const requestCache = new Map();

function fetchCached(url, errorMessage) {
  if (!requestCache.has(url)) {
    const request = fetchJson(url, errorMessage).catch((error) => {
      requestCache.delete(url);
      throw error;
    });

    requestCache.set(url, request);
  }

  return requestCache.get(url);
}

function getAnimatedFormSprite(sprite, pokemonName, formName, shiny = false) {
  if (!sprite) return null;

  let fileName = sprite.split('/').at(-1)?.replace(/\.png$/, '.gif');
  if (!fileName) return null;

  if (pokemonName === 'alcremie') {
    fileName = fileName.replace(/-sweet(?=\.gif$)/, '');
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${shiny ? 'shiny/' : ''}${fileName}`;
  }

  return `https://play.pokemonshowdown.com/sprites/${shiny ? 'ani-shiny' : 'ani'}/${formName}.gif`;
}

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
  fetchCached(
    `${POKE_API_BASE_URL}/pokemon/${encodeURIComponent(name)}`,
    'Failed to fetch Pokémon details'
  );

export const getPokemonSpecies = (name) =>
  fetchCached(
    `${POKE_API_BASE_URL}/pokemon-species/${encodeURIComponent(name)}`,
    'Failed to fetch Pokémon species'
  );

export async function getPokemonForms(forms = []) {
  if (forms.length <= 1) return [];
  return Promise.all(
    forms.map(async ({ name, url }) => {
      const form = await fetchCached(url, 'Failed to fetch Pokémon form');
      const pokemonName = form.pokemon.name;
      const staticImage = form.sprites.front_default;
      const staticShinyImage = form.sprites.front_shiny;
      return {
        name,
        label: form.form_name || name,
        image:
          getAnimatedFormSprite(staticImage, pokemonName, name) || staticImage,
        shinyImage:
          getAnimatedFormSprite(staticShinyImage, pokemonName, name, true) ||
          staticShinyImage,
        fallbackImage: staticImage,
        fallbackShinyImage: staticShinyImage,
      };
    })
  );
}

export async function preloadPokemonDetails(name) {
  const pokemon = await getPokemonDetails(name);

  await Promise.all([
    getPokemonSpecies(pokemon.species.name),
    getPokemonForms(pokemon.forms),
  ]);
}
