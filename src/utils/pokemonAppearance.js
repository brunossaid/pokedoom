export function getPokemonAppearance(pokemon, forms, selectedAppearance) {
  const defaultImage =
    pokemon.sprites.other?.showdown?.front_default ||
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/images/image-fallback.png';

  const femaleImage =
    pokemon.sprites.other?.showdown?.front_female ||
    pokemon.sprites.other?.home?.front_female ||
    pokemon.sprites.front_female ||
    defaultImage;

  const shinyImage =
    pokemon.sprites.other?.showdown?.front_shiny ||
    pokemon.sprites.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites.other?.home?.front_shiny ||
    pokemon.sprites.front_shiny ||
    defaultImage;

  const shinyFemaleImage =
    pokemon.sprites.other?.showdown?.front_shiny_female ||
    pokemon.sprites.other?.home?.front_shiny_female ||
    pokemon.sprites.front_shiny_female ||
    shinyImage;
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
    selectedAppearance === 'shiny' || selectedAppearance.endsWith(':shiny');
  const formName = selectedAppearance.startsWith('form:')
    ? selectedAppearance.slice(5).replace(/:shiny$/, '')
    : null;
  const selectedForm = forms.find(({ name }) => name === formName);
  return {
    image,
    femaleImage,
    shinyImage,
    shinyFemaleImage,
    isShiny,
    selectedForm,
    favoriteName: selectedForm?.name || pokemon.name,
    favoriteId: `${pokemon.name}:${selectedAppearance}`,
  };
}
