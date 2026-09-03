const itemRequirement = (name, label) => ({
  name,
  trigger: 'item',
  ...(label && { label }),
});

export const FORM_REQUIREMENT_FALLBACKS = {
  'tornadus-therian': [itemRequirement('reveal-glass')],
  'thundurus-therian': [itemRequirement('reveal-glass')],
  'landorus-therian': [itemRequirement('reveal-glass')],
  'enamorus-therian': [itemRequirement('reveal-glass')],
  'deoxys-attack': [itemRequirement('meteorite', 'Interact with a Meteorite')],
  'deoxys-defense': [itemRequirement('meteorite', 'Interact with a Meteorite')],
  'deoxys-speed': [itemRequirement('meteorite', 'Interact with a Meteorite')],
  'rotom-heat': [itemRequirement('rotom-catalog')],
  'rotom-wash': [itemRequirement('rotom-catalog')],
  'rotom-frost': [itemRequirement('rotom-catalog')],
  'rotom-fan': [itemRequirement('rotom-catalog')],
  'rotom-mow': [itemRequirement('rotom-catalog')],
  'kyurem-black': [itemRequirement('dna-splicers--merge', 'Use DNA Splicers with Zekrom'),],
  'kyurem-white': [itemRequirement('dna-splicers--merge', 'Use DNA Splicers with Reshiram'),],
  'necrozma-dusk': [itemRequirement('n-solarizer--merge', 'Use N-Solarizer with Solgaleo'),],
  'necrozma-dawn': [itemRequirement('n-lunarizer--merge', 'Use N-Lunarizer with Lunala'),],
  'calyrex-ice': [itemRequirement('reins-of-unity--merge', 'Use Reins of Unity with Glastrier'),],
  'calyrex-shadow': [itemRequirement('reins-of-unity--merge', 'Use Reins of Unity with Spectrier'),],
};
