export const REGIONAL_FORM_NAMES = ['alola', 'galar', 'hisui', 'paldea'];
export const MAJOR_TRANSFORMATION_PATTERN = /(?:-mega(?:-|$)|-primal$|-gmax$)/;

export function getVariantTag(name, speciesName) {
  const prefix = `${speciesName}-`;
  return name.startsWith(prefix) ? name.slice(prefix.length) : null;
}

export function getFormContext(pokemonName) {
  const region = REGIONAL_FORM_NAMES.find((formName) =>
    pokemonName.includes(`-${formName}`)
  );

  return {
    pokemonName,
    region,
    lockRegionalChain: false,
  };
}

export function getEvolutionSpeciesNames(chainLink) {
  return [
    chainLink.species.name,
    ...chainLink.evolves_to.flatMap(getEvolutionSpeciesNames),
  ];
}

export function getEvolutionPokemonNames(nodes) {
  return nodes.flatMap((node) => [
    node.name,
    ...getEvolutionPokemonNames(node.evolvesTo),
  ]);
}
