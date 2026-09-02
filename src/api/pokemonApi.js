import { fetchJson, POKE_API_BASE_URL } from './apiClient';

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
