import { useCallback, useMemo, useState } from 'react';
import { FavoritesContext } from './FavoritesContext';
import { getFavorites, removeFavoriteById, saveFavorites, upsertFavorite } from '../services/favoritesStorage';

function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(getFavorites);
  const saveFavorite = useCallback((favorite) => {
    const next = upsertFavorite(favorites, favorite);
    if (!saveFavorites(next)) return false;
    setFavorites(next);
    return true;
  }, [favorites]);
  const removeFavorite = useCallback((id) => {
    const next = removeFavoriteById(favorites, id);
    if (!saveFavorites(next)) return false;
    setFavorites(next);
    return true;
  }, [favorites]);
  const value = useMemo(() => ({ favorites, saveFavorite, removeFavorite }), [favorites, saveFavorite, removeFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export default FavoritesProvider;
