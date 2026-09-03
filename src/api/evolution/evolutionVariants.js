import {
  getVariantTag,
  MAJOR_TRANSFORMATION_PATTERN,
  REGIONAL_FORM_NAMES,
} from '../../utils/evolutionUtils';
import { getPokemonDetails, getPokemonSpecies } from '../pokemonApi';

async function getPokemonForEvolutionSpecies(speciesName, formContext) {
  const species = await getPokemonSpecies(speciesName);
  const exactCurrentVariety = species.varieties.find(
    ({ pokemon }) =>
      pokemon.name === formContext.pokemonName &&
      !MAJOR_TRANSFORMATION_PATTERN.test(pokemon.name)
  );
  const regionalVariety = formContext.region
    ? species.varieties.find(({ pokemon }) =>
        pokemon.name.includes(`-${formContext.region}`)
      )
    : null;
  const defaultVariety = species.varieties.find(
    ({ is_default: isDefault }) => isDefault
  );
  const selectedVariety = exactCurrentVariety || regionalVariety || defaultVariety;

  if (!selectedVariety) {
    throw new Error('No suitable Pokémon variety found for this species');
  }
  return getPokemonDetails(selectedVariety.pokemon.name);
}

export async function getEvolutionVariants(chainLink, formContext) {
  const species = await getPokemonSpecies(chainLink.species.name);
  const defaultVariety = species.varieties.find(
    ({ is_default: isDefault }) => isDefault
  );
  const hasRegionalVariety = species.varieties.some(({ pokemon }) =>
    REGIONAL_FORM_NAMES.some((region) => pokemon.name.includes(`-${region}`))
  );
  const regionalVariety = formContext.region
    ? species.varieties.find(({ pokemon }) => pokemon.name.includes(`-${formContext.region}`))
    : null;
  const currentVariety = species.varieties.find(
    ({ pokemon }) => pokemon.name === formContext.pokemonName
  );

  if (!defaultVariety) throw new Error('No default variety found for evolution');

  const variantGroups = new Map();
  const addVariant = (key, pokemonName, details, options = {}) => {
    variantGroups.set(key, {
      pokemonName,
      details,
      formName: options.formName || null,
      formUrl: options.formUrl || null,
      formTag: options.formTag ?? getVariantTag(options.formName || pokemonName, chainLink.species.name),
    });
  };

  if (chainLink.evolution_details.length === 0) {
    const childEvolutionDetails = chainLink.evolves_to.flatMap(
      ({ evolution_details: evolutionDetails }) => evolutionDetails
    );
    const requiredBaseForms = new Set(
      childEvolutionDetails.map(({ base_form: baseForm }) => baseForm?.name).filter(Boolean)
    );
    if (childEvolutionDetails.some(({ base_form: baseForm }) => !baseForm)) {
      requiredBaseForms.add(defaultVariety.pokemon.name);
    }
    const visibleBaseForms =
      currentVariety && !MAJOR_TRANSFORMATION_PATTERN.test(currentVariety.pokemon.name)
        ? [currentVariety.pokemon.name]
        : formContext.lockRegionalChain && formContext.region
          ? [...requiredBaseForms].filter((baseForm) => baseForm.includes(`-${formContext.region}`))
          : hasRegionalVariety && !formContext.region
            ? [...requiredBaseForms].filter((baseForm) => baseForm === defaultVariety.pokemon.name)
            : [...requiredBaseForms];

    if (visibleBaseForms.length > 0) {
      visibleBaseForms.forEach((baseFormName) => {
        addVariant(baseFormName, baseFormName, [], {
          formTag:
            hasRegionalVariety && baseFormName === defaultVariety.pokemon.name
              ? '__default__'
              : getVariantTag(baseFormName, chainLink.species.name),
        });
      });
    } else {
      const pokemon = await getPokemonForEvolutionSpecies(chainLink.species.name, formContext);
      if (pokemon.forms.length > 1) {
        pokemon.forms.forEach((form) => {
          addVariant(form.name, pokemon.name, [], { formName: form.name, formUrl: form.url });
        });
      } else {
        addVariant(pokemon.name, pokemon.name, []);
      }
    }
  } else if (formContext.lockRegionalChain && regionalVariety) {
    const matchingRegionalDetails = chainLink.evolution_details.filter(
      (detail) =>
        detail.evolved_form?.name === regionalVariety.pokemon.name ||
        detail.region?.name === formContext.region
    );
    addVariant(
      regionalVariety.pokemon.name,
      regionalVariety.pokemon.name,
      matchingRegionalDetails.length > 0 ? matchingRegionalDetails : chainLink.evolution_details
    );
  } else {
    chainLink.evolution_details.forEach((detail) => {
      const pokemonName = detail.evolved_form?.name || defaultVariety.pokemon.name;
      const currentDetails = variantGroups.get(pokemonName)?.details || [];
      const detailRegion =
        detail.region?.name ||
        REGIONAL_FORM_NAMES.find((region) => detail.base_form?.name.includes(`-${region}`));
      addVariant(pokemonName, pokemonName, [...currentDetails, detail], {
        formTag:
          hasRegionalVariety && pokemonName === defaultVariety.pokemon.name
            ? '__default__'
            : getVariantTag(pokemonName, chainLink.species.name) || detailRegion,
      });
    });

    const genderVarieties = species.varieties.filter(({ pokemon }) => /-(?:male|female)$/.test(pokemon.name));
    const hasExplicitEvolvedForms = chainLink.evolution_details.some(
      ({ evolved_form: evolvedForm }) => evolvedForm
    );

    if (genderVarieties.length > 1 && !hasExplicitEvolvedForms) {
      variantGroups.clear();
      genderVarieties.forEach(({ pokemon }) => {
        const formGender = pokemon.name.endsWith('-female') ? 'Female' : 'Male';
        addVariant(
          pokemon.name,
          pokemon.name,
          chainLink.evolution_details.map((detail) => ({ ...detail, formGender }))
        );
      });
    } else if (!hasExplicitEvolvedForms) {
      const evolutionVarieties = species.varieties.filter(
        ({ pokemon }) =>
          !MAJOR_TRANSFORMATION_PATTERN.test(pokemon.name) &&
          !REGIONAL_FORM_NAMES.some((region) => pokemon.name.includes(`-${region}`)) &&
          !pokemon.name.includes('-totem')
      );
      if (evolutionVarieties.length > 1) {
        variantGroups.clear();
        evolutionVarieties.forEach(({ pokemon }) => {
          addVariant(pokemon.name, pokemon.name, chainLink.evolution_details);
        });
      }
    }
  }

  if (
    chainLink.evolution_details.length > 0 &&
    formContext.region &&
    !formContext.lockRegionalChain &&
    regionalVariety
  ) {
    const fallbackDetails = chainLink.evolution_details;
    const regionalDetails = fallbackDetails.map((detail) => ({
      ...detail,
      region: detail.region || { name: formContext.region },
    }));
    if (!variantGroups.has(defaultVariety.pokemon.name)) {
      addVariant(defaultVariety.pokemon.name, defaultVariety.pokemon.name, fallbackDetails);
    }
    if (!variantGroups.has(regionalVariety.pokemon.name)) {
      addVariant(regionalVariety.pokemon.name, regionalVariety.pokemon.name, regionalDetails);
    }
  }

  return variantGroups;
}
