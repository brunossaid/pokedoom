export function getPokemonAppearance(pokemon, forms, selectedAppearance) {
  const defaultImage =
    pokemon.sprites.other?.showdown?.front_default ||
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/images/image-fallback.png';

  const femaleImage =
    pokemon.name === 'eevee'
      ? null
      : pokemon.sprites.other?.showdown?.front_female ||
        pokemon.sprites.other?.home?.front_female ||
        pokemon.sprites.front_female;

  const shinyImage =
    pokemon.sprites.other?.showdown?.front_shiny ||
    pokemon.sprites.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites.other?.home?.front_shiny ||
    pokemon.sprites.front_shiny ||
    defaultImage;

  const shinyFemaleImage =
    pokemon.sprites.other?.showdown?.front_shiny_female ||
    pokemon.sprites.other?.home?.front_shiny_female ||
    pokemon.sprites.front_shiny_female;

  const formImages = Object.fromEntries(
    forms
      .flatMap((form) => [
        [`form:${form.name}`, form.image],
        [`form:${form.name}:shiny`, form.shinyImage],
      ])
      .filter(([, image]) => image)
  );
  const image =
    {
      default: defaultImage,
      female: femaleImage,
      shiny: shinyImage,
      'shiny-female': shinyFemaleImage,
      ...formImages,
    }[selectedAppearance] || defaultImage;
  const isShiny =
    selectedAppearance === 'shiny' ||
    selectedAppearance === 'shiny-female' ||
    selectedAppearance.endsWith(':shiny');
  const formName = selectedAppearance.startsWith('form:')
    ? selectedAppearance.slice(5).replace(/:shiny$/, '')
    : null;
  const selectedForm = forms.find(({ name }) => name === formName);
  const fallbackImage = selectedForm
    ? isShiny
      ? selectedForm.fallbackShinyImage
      : selectedForm.fallbackImage
    : null;
  return {
    image,
    fallbackImage,
    femaleImage,
    shinyImage,
    shinyFemaleImage,
    isShiny,
    selectedForm,
    favoriteName: selectedForm?.name || pokemon.name,
    favoriteId: `${pokemon.name}:${selectedAppearance}`,
  };
}

export function getValidInitialAppearance(pokemon, forms, requestedAppearance) {
  const fallbackAppearance =
    forms.length > 1 ? `form:${forms[0].name}` : 'default';

  if (typeof requestedAppearance !== 'string') return fallbackAppearance;

  if (requestedAppearance === 'default') return requestedAppearance;

  const femaleImage =
    pokemon.sprites.other?.showdown?.front_female ||
    pokemon.sprites.other?.home?.front_female ||
    pokemon.sprites.front_female;
  const shinyImage =
    pokemon.sprites.other?.showdown?.front_shiny ||
    pokemon.sprites.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites.other?.home?.front_shiny ||
    pokemon.sprites.front_shiny;
  const shinyFemaleImage =
    pokemon.sprites.other?.showdown?.front_shiny_female ||
    pokemon.sprites.other?.home?.front_shiny_female ||
    pokemon.sprites.front_shiny_female;

  if (requestedAppearance === 'female' && femaleImage) return requestedAppearance;
  if (requestedAppearance === 'shiny' && shinyImage) return requestedAppearance;
  if (requestedAppearance === 'shiny-female' && shinyFemaleImage) {
    return requestedAppearance;
  }

  if (requestedAppearance.startsWith('form:')) {
    const isShinyForm = requestedAppearance.endsWith(':shiny');
    const requestedFormName = requestedAppearance
      .slice(5)
      .replace(/:shiny$/, '');
    const requestedForm = forms.find(({ name }) => name === requestedFormName);

    if (requestedForm && (isShinyForm ? requestedForm.shinyImage : requestedForm.image)) {
      return requestedAppearance;
    }
  }

  return fallbackAppearance;
}
