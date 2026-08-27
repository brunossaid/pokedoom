const BASE_URL = 'https://pokeapi.co/api/v2';
const REGION_GENERATION_FALLBACKS = {
  hisui: 8,
  orre: 3,
};

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

export async function getPokemonByRegion(region) {
  const regionResponse = await fetch(`${BASE_URL}/region/${region}`);

  if (!regionResponse.ok) {
    throw new Error('Failed to fetch Pokémon region');
  }

  const regionData = await regionResponse.json();
  const fallbackGeneration = REGION_GENERATION_FALLBACKS[region];
  const generationUrl =
    regionData.main_generation?.url ||
    (fallbackGeneration ? `${BASE_URL}/generation/${fallbackGeneration}` : null);

  if (!generationUrl) {
    return { pokemon_species: [] };
  }

  const generationResponse = await fetch(generationUrl);

  if (!generationResponse.ok) {
    throw new Error('Failed to fetch the region generation');
  }

  return generationResponse.json();
}

export async function getPokemonDetails(name) {
  const response = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon details');
  }

  return response.json();
}

export async function getPokemonSpecies(name) {
  const response = await fetch(
    `${BASE_URL}/pokemon-species/${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon species');
  }

  return response.json();
}

async function addEvolutionImages(chainLink) {
  const [pokemon, evolutionDetails] = await Promise.all([
    getPokemonDetails(chainLink.species.name),
    Promise.all(
      chainLink.evolution_details.map(async (detail) => {
        const evolutionItem = detail.item || detail.held_item;

        if (!evolutionItem?.url) {
          return { ...detail, itemSprite: null };
        }

        const itemResponse = await fetch(evolutionItem.url);
        const itemData = itemResponse.ok ? await itemResponse.json() : null;

        return {
          ...detail,
          itemSprite: itemData?.sprites?.default || null,
        };
      })
    ),
  ]);

  return {
    name: chainLink.species.name,
    image:
      pokemon.sprites.other['official-artwork'].front_default ||
      pokemon.sprites.front_default ||
      '/images/image-fallback.png',
    evolutionDetails,
    evolvesTo: await Promise.all(chainLink.evolves_to.map(addEvolutionImages)),
  };
}

function getEvolutionSpeciesNames(chainLink) {
  return [
    chainLink.species.name,
    ...chainLink.evolves_to.flatMap(getEvolutionSpeciesNames),
  ];
}

export async function getPokemonEvolutionFamily(speciesName) {
  const speciesData = await getPokemonSpecies(speciesName);
  const evolutionResponse = await fetch(speciesData.evolution_chain.url);

  if (!evolutionResponse.ok) {
    throw new Error('Failed to fetch Pokémon evolution chain');
  }

  const evolutionData = await evolutionResponse.json();
  const familySpecies = getEvolutionSpeciesNames(evolutionData.chain);
  const [chain, familyForms] = await Promise.all([
    addEvolutionImages(evolutionData.chain),
    Promise.all(familySpecies.map(getPokemonSpecialForms)),
  ]);

  return {
    chain,
    specialForms: familyForms.flat(),
  };
}

export async function getPokemonSpecialForms(speciesName) {
  const speciesData = await getPokemonSpecies(speciesName);
  const specialVarieties = speciesData.varieties.filter(({ pokemon }) =>
    /(?:-mega(?:-|$)|-primal$|-gmax$)/.test(pokemon.name)
  );

  return Promise.all(
    specialVarieties.map(async ({ pokemon }) => {
      const [details, formResponse] = await Promise.all([
        getPokemonDetails(pokemon.name),
        fetch(`${BASE_URL}/pokemon-form/${encodeURIComponent(pokemon.name)}`),
      ]);
      const formData = formResponse.ok
        ? await formResponse.json()
        : { trigger_conditions: [] };
      const requirements = await Promise.all(
        (formData.trigger_conditions || []).map(async (condition) => {
          if (!condition.url) {
            return { ...condition, sprite: null };
          }

          const resourceResponse = await fetch(condition.url);
          const resourceData = resourceResponse.ok ? await resourceResponse.json() : null;

          return {
            ...condition,
            sprite: resourceData?.sprites?.default || null,
          };
        })
      );

      return {
        name: details.name,
        image:
          details.sprites.other['official-artwork'].front_default ||
          details.sprites.front_default ||
          '/images/image-fallback.png',
        types: details.types.map(({ type }) => type.name),
        requirements,
        category: details.name.includes('-primal')
          ? 'Primal Reversion'
          : details.name.endsWith('-gmax')
            ? 'Gigantamax'
            : 'Mega Evolution',
      };
    })
  );
}

export async function getPokemonDefenses(typeNames) {
  const typeData = await Promise.all(
    typeNames.map(async (typeName) => {
      const response = await fetch(`${BASE_URL}/type/${encodeURIComponent(typeName)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon type effectiveness');
      }

      return response.json();
    })
  );

  const multipliers = new Map();

  function multiply(typeName, value) {
    multipliers.set(typeName, (multipliers.get(typeName) ?? 1) * value);
  }

  typeData.forEach(({ damage_relations: relations }) => {
    relations.double_damage_from.forEach(({ name }) => multiply(name, 2));
    relations.half_damage_from.forEach(({ name }) => multiply(name, 0.5));
    relations.no_damage_from.forEach(({ name }) => multiply(name, 0));
  });

  return [...multipliers.entries()]
    .map(([name, multiplier]) => ({ name, multiplier }))
    .filter(({ multiplier }) => multiplier !== 1)
    .sort((a, b) => b.multiplier - a.multiplier || a.name.localeCompare(b.name));
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
