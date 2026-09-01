import { STORAGE_KEYS } from '../constants/storageKeys';
import { readStoredList, removeStoredValue, writeStoredList } from './storage';

const HISTORY_LIMIT = 100;

function isValidHistoryEntry(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    Number.isInteger(entry.pokemonId) &&
    entry.pokemonId > 0 &&
    typeof entry.name === 'string' &&
    entry.name.length > 0 &&
    typeof entry.image === 'string' &&
    entry.image.length > 0 &&
    typeof entry.viewedAt === 'string' &&
    Number.isFinite(Date.parse(entry.viewedAt))
  );
}

export function getHistory() {
  return readStoredList(STORAGE_KEYS.history)
    .filter(isValidHistoryEntry)
    .slice(0, HISTORY_LIMIT);
}

export function addHistoryEntry(entry) {
  const history = getHistory();
  const nextHistory = [
    entry,
    ...history.filter((item) => item.id !== entry.id),
  ].slice(0, HISTORY_LIMIT);
  writeStoredList(STORAGE_KEYS.history, nextHistory);
  return nextHistory;
}

export function recordPokemonView(pokemon) {
  const image =
    pokemon.sprites.other?.showdown?.front_default ||
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/images/image-fallback.png';

  return addHistoryEntry({
    id: pokemon.name,
    pokemonId: pokemon.id,
    name: pokemon.name,
    image,
    viewedAt: new Date().toISOString(),
  });
}

export function clearStoredHistory() {
  return removeStoredValue(STORAGE_KEYS.history);
}
