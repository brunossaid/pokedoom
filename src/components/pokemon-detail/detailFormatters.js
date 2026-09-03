import { capitalize } from '../../utils/textUtils';

export function formatDisplayName(name) {
  return name.split('-').map(capitalize).join(' ');
}

export function formatEvolutionCondition(detail) {
  const conditions = [];
  if (detail.min_level) conditions.push(`Level ${detail.min_level}`);
  if (detail.item)
    conditions.push(`Use ${formatDisplayName(detail.item.name)}`);
  if (detail.held_item)
    conditions.push(`Hold ${formatDisplayName(detail.held_item.name)}`);
  if (detail.trigger?.name === 'trade') conditions.push('Trade');
  if (detail.min_happiness)
    conditions.push(`Happiness ${detail.min_happiness}`);
  if (detail.min_affection)
    conditions.push(`Affection ${detail.min_affection}`);
  if (detail.min_beauty) conditions.push(`Beauty ${detail.min_beauty}`);
  if (detail.min_damage_taken) {
    conditions.push(
      `Take at least ${detail.min_damage_taken} recoil damage without fainting`
    );
  }
  if (detail.time_of_day)
    conditions.push(formatDisplayName(detail.time_of_day));
  if (detail.known_move)
    conditions.push(`Know ${formatDisplayName(detail.known_move.name)}`);
  if (detail.known_move_type) {
    conditions.push(
      `Know a ${formatDisplayName(detail.known_move_type.name)} move`
    );
  }
  if (detail.location)
    conditions.push(`At ${formatDisplayName(detail.location.name)}`);
  if (detail.gender === 1) conditions.push('Female only');
  if (detail.gender === 2) conditions.push('Male only');
  if (detail.formGender) conditions.push(`${detail.formGender} only`);
  if (detail.region)
    conditions.push(`In ${formatDisplayName(detail.region.name)}`);
  if (detail.needs_overworld_rain) conditions.push('While raining');
  if (detail.turn_upside_down) conditions.push('Turn device upside down');
  return conditions.length > 0
    ? conditions.join(' · ')
    : formatDisplayName(detail.trigger?.name || 'Special');
}

export function getEvolutionPriority(detail) {
  if (detail.item || detail.held_item) return 1;
  if (detail.min_level) return 2;
  if (detail.min_happiness) return 3;
  if (detail.location) return 4;
  return 5;
}

export function formatSpecialRequirement(requirement) {
  if (requirement.label) return requirement.label;
  if (requirement.trigger === 'gigantamax-factor') return 'Gigantamax Factor';
  if (requirement.trigger === 'item' && requirement.name)
    return `Use ${formatDisplayName(requirement.name)}`;
  if (requirement.trigger === 'held-item' && requirement.name)
    return `Hold ${formatDisplayName(requirement.name)}`;
  if (requirement.trigger === 'move' && requirement.name) {
    return `Know ${formatDisplayName(requirement.name)}`;
  }
  if (requirement.name) return formatDisplayName(requirement.name);
  return formatDisplayName(requirement.trigger || 'Special condition');
}
