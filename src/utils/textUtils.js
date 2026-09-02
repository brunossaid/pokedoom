export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const SPECIAL_POKEMON_NAMES = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',

  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",

  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',

  'type-null': 'Type: Null',

  flabebe: 'Flabébé',

  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',

  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',

  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
};

export function formatPokemonName(name) {
  if (SPECIAL_POKEMON_NAMES[name]) {
    return SPECIAL_POKEMON_NAMES[name];
  }

  return name.split('-').map(capitalize).join(' ');
}
