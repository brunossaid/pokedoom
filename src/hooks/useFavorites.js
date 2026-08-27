import { useState } from 'react';
import {
  getFavorites,
  removeFavoriteById,
  saveFavorites,
  upsertFavorite,
} from '../services/favoritesStorage';

export function useFavorites() {
  const [favorites, setFavorites] = useState(getFavorites);

  function saveFavorite(favorite) {
    const nextFavorites = upsertFavorite(favorites, favorite);
    saveFavorites(nextFavorites);
    setFavorites(nextFavorites);
  }

  function removeFavorite(favoriteId) {
    const nextFavorites = removeFavoriteById(favorites, favoriteId);
    saveFavorites(nextFavorites);
    setFavorites(nextFavorites);
  }

  return { favorites, saveFavorite, removeFavorite };
}
