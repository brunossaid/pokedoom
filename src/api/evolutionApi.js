import {
  getEvolutionPokemonNames,
  getEvolutionSpeciesNames,
  getFormContext,
  REGIONAL_FORM_NAMES,
} from '../utils/evolutionUtils';
import { getPokemonSpecies } from './pokemonApi';
import {
  addEvolutionNodes,
  findEvolutionDetails,
} from './evolution/evolutionTree';
import { getPokemonSpecialForms } from './evolution/evolutionForms';

export async function getPokemonEvolutionFamily(
  speciesName,
  pokemonName = speciesName
) {
  const speciesData = await getPokemonSpecies(speciesName);
  const formContext = getFormContext(pokemonName);

  if (!speciesData.evolution_chain?.url) {
    return {
      chain: null,
      specialForms: await getPokemonSpecialForms(speciesName),
    };
  }

  const evolutionResponse = await fetch(speciesData.evolution_chain.url);

  if (!evolutionResponse.ok) {
    throw new Error('Failed to fetch Pokémon evolution chain');
  }

  const evolutionData = await evolutionResponse.json();
  const currentEvolutionDetails =
    findEvolutionDetails(evolutionData.chain, speciesName) || [];
  const evolutionDetailRegions = currentEvolutionDetails.map(
    (detail) =>
      detail.region?.name ||
      REGIONAL_FORM_NAMES.find((region) =>
        detail.base_form?.name.includes(`-${region}`)
      ) ||
      null
  );
  const uniqueEvolutionRegions = [
    ...new Set(evolutionDetailRegions.filter(Boolean)),
  ];
  const hasOnlyRegionalEvolutionDetails =
    evolutionDetailRegions.length > 0 &&
    evolutionDetailRegions.every(Boolean) &&
    uniqueEvolutionRegions.length === 1;
  const inferredRegion =
    formContext.region ||
    (hasOnlyRegionalEvolutionDetails ? uniqueEvolutionRegions[0] : null);
  const rootSpeciesName = evolutionData.chain.species.name;
  const rootSpeciesData =
    rootSpeciesName === speciesName
      ? speciesData
      : await getPokemonSpecies(rootSpeciesName);
  const chainFormContext = {
    ...formContext,
    region: inferredRegion,
    lockRegionalChain: Boolean(
      inferredRegion &&
      rootSpeciesData.varieties.some(({ pokemon }) =>
        pokemon.name.includes(`-${inferredRegion}`)
      )
    ),
  };
  const familySpecies = getEvolutionSpeciesNames(evolutionData.chain);
  const [chainNodes, familyForms] = await Promise.all([
    addEvolutionNodes(evolutionData.chain, chainFormContext),
    Promise.all(familySpecies.map(getPokemonSpecialForms)),
  ]);

  return {
    chain: chainNodes,
    specialForms: familyForms
      .flat()
      .filter(
        (form) => !getEvolutionPokemonNames(chainNodes).includes(form.name)
      )
      .filter(
        (form) =>
          !chainFormContext.region ||
          form.name.includes(`-${chainFormContext.region}`)
      ),
  };
}

export { getPokemonSpecialForms } from './evolution/evolutionForms';
