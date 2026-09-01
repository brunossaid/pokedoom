import { FORM_REQUIREMENT_FALLBACKS } from '../constants/formRequirements';
import {
  getEvolutionPokemonNames,
  getEvolutionSpeciesNames,
  getFormContext,
  getVariantTag,
  MAJOR_TRANSFORMATION_PATTERN,
  REGIONAL_FORM_NAMES,
} from '../utils/evolutionUtils';
import { POKE_API_BASE_URL as BASE_URL } from './apiClient';
import { getPokemonDetails, getPokemonSpecies } from './pokemonApi';

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
  const selectedVariety =
    exactCurrentVariety || regionalVariety || defaultVariety;

  if (!selectedVariety) {
    throw new Error('No suitable Pokémon variety found for this species');
  }

  return getPokemonDetails(selectedVariety.pokemon.name);
}

async function addItemSprites(evolutionDetails) {
  return Promise.all(
    evolutionDetails.map(async (detail) => {
      const evolutionItem = detail.item || detail.held_item;
      if (!evolutionItem?.url) return { ...detail, itemSprite: null };

      const itemResponse = await fetch(evolutionItem.url);
      const itemData = itemResponse.ok ? await itemResponse.json() : null;
      return { ...detail, itemSprite: itemData?.sprites?.default || null };
    })
  );
}

async function addEvolutionNodes(chainLink, formContext) {
  const species = await getPokemonSpecies(chainLink.species.name);
  const defaultVariety = species.varieties.find(
    ({ is_default: isDefault }) => isDefault
  );
  const hasRegionalVariety = species.varieties.some(({ pokemon }) =>
    REGIONAL_FORM_NAMES.some((region) => pokemon.name.includes(`-${region}`))
  );
  const regionalVariety = formContext.region
    ? species.varieties.find(({ pokemon }) =>
        pokemon.name.includes(`-${formContext.region}`)
      )
    : null;
  const currentVariety = species.varieties.find(
    ({ pokemon }) => pokemon.name === formContext.pokemonName
  );

  if (!defaultVariety)
    throw new Error('No default variety found for evolution');

  const variantGroups = new Map();
  const addVariant = (key, pokemonName, details, options = {}) => {
    variantGroups.set(key, {
      pokemonName,
      details,
      formName: options.formName || null,
      formUrl: options.formUrl || null,
      formTag:
        options.formTag ??
        getVariantTag(options.formName || pokemonName, chainLink.species.name),
    });
  };

  if (chainLink.evolution_details.length === 0) {
    const childEvolutionDetails = chainLink.evolves_to.flatMap(
      ({ evolution_details: evolutionDetails }) => evolutionDetails
    );
    const requiredBaseForms = new Set(
      childEvolutionDetails
        .map(({ base_form: baseForm }) => baseForm?.name)
        .filter(Boolean)
    );
    if (childEvolutionDetails.some(({ base_form: baseForm }) => !baseForm)) {
      requiredBaseForms.add(defaultVariety.pokemon.name);
    }
    const visibleBaseForms =
      currentVariety &&
      !MAJOR_TRANSFORMATION_PATTERN.test(currentVariety.pokemon.name)
        ? [currentVariety.pokemon.name]
        : formContext.lockRegionalChain && formContext.region
          ? [...requiredBaseForms].filter((baseForm) =>
              baseForm.includes(`-${formContext.region}`)
            )
          : hasRegionalVariety && !formContext.region
            ? [...requiredBaseForms].filter(
                (baseForm) => baseForm === defaultVariety.pokemon.name
              )
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
      const pokemon = await getPokemonForEvolutionSpecies(
        chainLink.species.name,
        formContext
      );
      if (pokemon.forms.length > 1) {
        pokemon.forms.forEach((form) => {
          addVariant(form.name, pokemon.name, [], {
            formName: form.name,
            formUrl: form.url,
          });
        });
      } else {
        addVariant(pokemon.name, pokemon.name, []);
      }
    }
  } else if (formContext.lockRegionalChain && regionalVariety) {
    // A chain opened from a regional Pokémon must remain in that regional
    // branch. A normal base Pokémon may still show regional alternatives.
    const matchingRegionalDetails = chainLink.evolution_details.filter(
      (detail) =>
        detail.evolved_form?.name === regionalVariety.pokemon.name ||
        detail.region?.name === formContext.region
    );
    addVariant(
      regionalVariety.pokemon.name,
      regionalVariety.pokemon.name,
      matchingRegionalDetails.length > 0
        ? matchingRegionalDetails
        : chainLink.evolution_details
    );
  } else {
    chainLink.evolution_details.forEach((detail) => {
      const pokemonName =
        detail.evolved_form?.name || defaultVariety.pokemon.name;
      const currentDetails = variantGroups.get(pokemonName)?.details || [];
      const detailRegion =
        detail.region?.name ||
        REGIONAL_FORM_NAMES.find((region) =>
          detail.base_form?.name.includes(`-${region}`)
        );
      addVariant(pokemonName, pokemonName, [...currentDetails, detail], {
        formTag:
          hasRegionalVariety && pokemonName === defaultVariety.pokemon.name
            ? '__default__'
            : getVariantTag(pokemonName, chainLink.species.name) ||
              detailRegion,
      });
    });

    const genderVarieties = species.varieties.filter(({ pokemon }) =>
      /-(?:male|female)$/.test(pokemon.name)
    );
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
          chainLink.evolution_details.map((detail) => ({
            ...detail,
            formGender,
          }))
        );
      });
    } else if (!hasExplicitEvolvedForms) {
      const evolutionVarieties = species.varieties.filter(
        ({ pokemon }) =>
          !MAJOR_TRANSFORMATION_PATTERN.test(pokemon.name) &&
          !REGIONAL_FORM_NAMES.some((region) =>
            pokemon.name.includes(`-${region}`)
          ) &&
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
      addVariant(
        defaultVariety.pokemon.name,
        defaultVariety.pokemon.name,
        fallbackDetails
      );
    }
    if (!variantGroups.has(regionalVariety.pokemon.name)) {
      addVariant(
        regionalVariety.pokemon.name,
        regionalVariety.pokemon.name,
        regionalDetails
      );
    }
  }

  const descendantGroups = await Promise.all(
    chainLink.evolves_to.map((evolution) =>
      addEvolutionNodes(evolution, formContext)
    )
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

            if (evolution.formTag) {
              return evolution.formTag === variant.formTag;
            }

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

function findEvolutionDetails(chainLink, speciesName) {
  if (chainLink.species.name === speciesName) {
    return chainLink.evolution_details;
  }

  for (const evolution of chainLink.evolves_to) {
    const details = findEvolutionDetails(evolution, speciesName);
    if (details) return details;
  }

  return null;
}

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
  const inferredRegion =
    formContext.region ||
    currentEvolutionDetails
      .map(
        (detail) =>
          detail.region?.name ||
          REGIONAL_FORM_NAMES.find((region) =>
            detail.base_form?.name.includes(`-${region}`)
          )
      )
      .find(Boolean);
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
      ),
  };
}

export async function getPokemonSpecialForms(speciesName) {
  const speciesData = await getPokemonSpecies(speciesName);
  const isRegionalOrTotem = (name) =>
    REGIONAL_FORM_NAMES.some((region) => name.includes(`-${region}`)) ||
    name.includes('-totem');
  const isBaseGenderForm = (name) => /-(?:male|female)$/.test(name);
  const alternateVarieties = speciesData.varieties.filter(
    ({ is_default: isDefault, pokemon }) =>
      !isDefault &&
      !isRegionalOrTotem(pokemon.name) &&
      !isBaseGenderForm(pokemon.name)
  );
  const hasRegularAlternateForms = alternateVarieties.some(
    ({ pokemon }) => !MAJOR_TRANSFORMATION_PATTERN.test(pokemon.name)
  );
  const specialVarieties = speciesData.varieties.filter(
    ({ is_default: isDefault, pokemon }) =>
      alternateVarieties.some(
        (variety) => variety.pokemon.name === pokemon.name
      ) ||
      (isDefault && hasRegularAlternateForms)
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
      const triggerConditions =
        formData.trigger_conditions?.length > 0
          ? formData.trigger_conditions
          : FORM_REQUIREMENT_FALLBACKS[details.name] || [];
      const requirements = await Promise.all(
        triggerConditions.map(async (condition) => {
          const resourceUrl =
            condition.url ||
            (condition.trigger === 'item' && condition.name
              ? `${BASE_URL}/item/${encodeURIComponent(condition.name)}`
              : null);
          if (!resourceUrl) return { ...condition, sprite: null };

          const resourceResponse = await fetch(resourceUrl);
          const resourceData = resourceResponse.ok
            ? await resourceResponse.json()
            : null;

          return {
            ...condition,
            sprite: resourceData?.sprites?.default || null,
          };
        })
      );

      const formLabel = formData.form_name
        ?.split('-')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');

      return {
        name: details.name,
        image:
          details.sprites.other?.showdown?.front_default ||
          details.sprites.other?.['official-artwork']?.front_default ||
          details.sprites.front_default ||
          '/images/image-fallback.png',
        types: details.types.map(({ type }) => type.name),
        requirements,
        category: details.name.includes('-primal')
          ? 'Primal Reversion'
          : details.name.endsWith('-gmax')
            ? 'Gigantamax'
            : details.name.includes('-mega')
              ? details.name.includes('-female-mega')
                ? 'Female Mega Evolution'
                : details.name.includes('-male-mega')
                  ? 'Male Mega Evolution'
                  : 'Mega Evolution'
              : formLabel
                ? `${formLabel} Form`
                : 'Base Form',
      };
    })
  );
}
