import { STORAGE_KEYS } from '../constants/storageKeys';
import { readStoredList, writeStoredList } from './storage';

function isValidDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isValidFavorite(favorite) {
  return (
    favorite !== null &&
    typeof favorite === 'object' &&
    typeof favorite.id === 'string' &&
    favorite.id.length > 0 &&
    Number.isInteger(favorite.pokemonId) &&
    favorite.pokemonId > 0 &&
    typeof favorite.name === 'string' &&
    favorite.name.length > 0 &&
    typeof favorite.appearance === 'string' &&
    favorite.appearance.length > 0 &&
    typeof favorite.image === 'string' &&
    favorite.image.length > 0 &&
    typeof favorite.isShiny === 'boolean' &&
    Number.isInteger(favorite.priority) &&
    favorite.priority > 0 &&
    typeof favorite.tag === 'string' &&
    favorite.tag.trim().length > 0 &&
    typeof favorite.note === 'string' &&
    favorite.note.length <= 200 &&
    isValidDate(favorite.savedAt)
  );
}

export function getFavorites() {
  return readStoredList(STORAGE_KEYS.favorites).filter(isValidFavorite);
}

export function saveFavorites(favorites) {
  return writeStoredList(STORAGE_KEYS.favorites, favorites);
}

export function upsertFavorite(favorites, favorite) {
  return [
    ...favorites.filter((item) => item.id !== favorite.id),
    favorite,
  ];
}

export function removeFavoriteById(favorites, favoriteId) {
  return favorites.filter((favorite) => favorite.id !== favoriteId);
}
