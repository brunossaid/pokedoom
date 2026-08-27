import { fetchJson, POKE_API_BASE_URL } from './apiClient';

export async function getPokemonDefenses(typeNames) {
  const typeData = await Promise.all(typeNames.map((name) =>
    fetchJson(`${POKE_API_BASE_URL}/type/${encodeURIComponent(name)}`, 'Failed to fetch Pokémon type effectiveness')
  ));
  const multipliers = new Map();
  const multiply = (name, value) => multipliers.set(name, (multipliers.get(name) ?? 1) * value);
  typeData.forEach(({ damage_relations: relations }) => {
    relations.double_damage_from.forEach(({ name }) => multiply(name, 2));
    relations.half_damage_from.forEach(({ name }) => multiply(name, 0.5));
    relations.no_damage_from.forEach(({ name }) => multiply(name, 0));
  });
  return [...multipliers.entries()]
    .map(([name, multiplier]) => ({ name, multiplier }))
    .filter(({ multiplier }) => multiplier !== 1)
    .sort((a, b) => b.multiplier - a.multiplier || a.name.localeCompare(b.name));
}
