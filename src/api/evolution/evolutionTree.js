import { getPokemonDetails } from '../pokemonApi';
import { addItemSprites } from './evolutionConditions';
import { getEvolutionVariants } from './evolutionVariants';

export async function addEvolutionNodes(chainLink, formContext) {
  const variantGroups = await getEvolutionVariants(chainLink, formContext);
  const descendantGroups = await Promise.all(
    chainLink.evolves_to.map((evolution) => addEvolutionNodes(evolution, formContext))
  );
  const evolvesTo = descendantGroups.flat();

  return Promise.all(
    [...variantGroups.entries()].map(async ([key, variant]) => {
      const [pokemon, evolutionDetails, formResponse] = await Promise.all([
        getPokemonDetails(variant.pokemonName),
        addItemSprites(variant.details),
        variant.formUrl ? fetch(variant.formUrl) : Promise.resolve(null),
      ]);
      const formData = formResponse?.ok ? await formResponse.json() : null;
      const matchingEvolutions = variant.formTag
        ? evolvesTo.filter((evolution) => {
            if (evolution.baseForms.length > 0) {
              return evolution.baseForms.includes(variant.pokemonName);
            }
            if (evolution.formTag) return evolution.formTag === variant.formTag;
            return variant.formTag === '__default__';
          })
        : evolvesTo;

      return {
        key,
        name: pokemon.name,
        displayName: variant.formName || pokemon.name,
        formTag: variant.formTag,
        baseForms: [
          ...new Set(
            variant.details
              .map(({ base_form: baseForm }) => baseForm?.name)
              .filter(Boolean)
          ),
        ],
        speciesName: chainLink.species.name,
        image:
          pokemon.sprites.other?.showdown?.front_default ||
          formData?.sprites?.front_default ||
          pokemon.sprites.other?.['official-artwork']?.front_default ||
          pokemon.sprites.front_default ||
          '/images/image-fallback.png',
        evolutionDetails,
        evolvesTo: matchingEvolutions,
      };
    })
  );
}

export function findEvolutionDetails(chainLink, speciesName) {
  if (chainLink.species.name === speciesName) return chainLink.evolution_details;

  for (const evolution of chainLink.evolves_to) {
    const details = findEvolutionDetails(evolution, speciesName);
    if (details) return details;
  }
  return null;
}
