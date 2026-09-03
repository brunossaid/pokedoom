import { FORM_REQUIREMENT_FALLBACKS } from '../../constants/formRequirements';
import {
  MAJOR_TRANSFORMATION_PATTERN,
  REGIONAL_FORM_NAMES,
} from '../../utils/evolutionUtils';
import { POKE_API_BASE_URL as BASE_URL } from '../apiClient';
import { getPokemonDetails, getPokemonSpecies } from '../pokemonApi';

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
