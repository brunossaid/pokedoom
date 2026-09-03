import { useState } from 'react';
import FavoriteModal from '../components/FavoriteModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import FavoriteCard from '../components/favorites/FavoriteCard';
import FavoritesFilters from '../components/favorites/FavoritesFilters';
import { NoFavoriteResults, NoFavorites } from '../components/favorites/FavoritesEmptyState';
import { capitalize } from '../utils/textUtils';
import { useFavorites } from '../hooks/useFavorites';

const FAVORITES_PER_PAGE = 6;

function Favorites() {
  const { favorites, saveFavorite, removeFavorite } = useFavorites();
  const [editingFavorite, setEditingFavorite] = useState(null);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [ratingDraft, setRatingDraft] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamDraft, setTeamDraft] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [favoriteToRemove, setFavoriteToRemove] = useState(null);
  const [storageError, setStorageError] = useState('');

  const sortedFavorites = [...favorites].sort(
    (first, second) => first.rating - second.rating || first.name.localeCompare(second.name)
  );
  const ratings = [...new Set(favorites.map((favorite) => favorite.rating))]
    .sort((first, second) => first - second);
  const teams = [
    ...new Map(
      favorites.map((favorite) => [favorite.tag.toLowerCase(), favorite.tag])
    ).values(),
  ].sort((first, second) => first.localeCompare(second));
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFavorites = sortedFavorites.filter((favorite) => {
    const matchesSearch =
      !normalizedSearch ||
      favorite.name.toLowerCase().includes(normalizedSearch) ||
      favorite.tag.toLowerCase().includes(normalizedSearch);
    const matchesRating =
      !selectedRating || favorite.rating === Number(selectedRating);
    const matchesTeam =
      !selectedTeam || favorite.tag.toLowerCase() === selectedTeam.toLowerCase();
    return matchesSearch && matchesRating && matchesTeam;
  });
  const totalPages = Math.max(1, Math.ceil(visibleFavorites.length / FAVORITES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const favoritesToShow = visibleFavorites.slice(
    (currentPage - 1) * FAVORITES_PER_PAGE,
    currentPage * FAVORITES_PER_PAGE
  );

  function editFavorite(formValues) {
    const saved = saveFavorite({
      ...editingFavorite,
      ...formValues,
      savedAt: new Date().toISOString(),
    });
    if (!saved) {
      setStorageError('Unable to update this favorite. Check your browser storage and try again.');
      return;
    }
    setStorageError('');
    setEditingFavorite(null);
  }

  function confirmFavoriteRemoval() {
    const removed = removeFavorite(favoriteToRemove.id);
    if (!removed) {
      setStorageError('Unable to remove this favorite. Check your browser storage and try again.');
      setFavoriteToRemove(null);
      return;
    }
    setStorageError('');
    setFavoriteToRemove(null);
  }

  function submitSearch(event) {
    event.preventDefault();
    setSearch(searchDraft);
    setSelectedRating(ratingDraft);
    setSelectedTeam(teamDraft);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setSearchDraft('');
    setSelectedRating('');
    setRatingDraft('');
    setSelectedTeam('');
    setTeamDraft('');
    setPage(1);
  }

  return (
    <section className="favorites-page" aria-labelledby="favorites-title">
      <header className="favorites-heading">
        <div><span aria-hidden="true">♥</span><h2 id="favorites-title">Your favorites</h2></div>
        <p>Ordered from highest to lowest rating.</p>
      </header>

      {storageError && <div className="error-state" role="alert"><p>{storageError}</p></div>}

      {sortedFavorites.length === 0 ? <NoFavorites /> : (
        <>
          <FavoritesFilters
            search={search}
            selectedRating={selectedRating}
            selectedTeam={selectedTeam}
            searchDraft={searchDraft}
            ratingDraft={ratingDraft}
            teamDraft={teamDraft}
            ratings={ratings}
            teams={teams}
            showFilters={showFilters}
            resultCount={visibleFavorites.length}
            onSearchDraftChange={setSearchDraft}
            onRatingDraftChange={setRatingDraft}
            onTeamDraftChange={setTeamDraft}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onSubmit={submitSearch}
            onClear={clearFilters}
          />

          {visibleFavorites.length === 0 ? <NoFavoriteResults onClear={clearFilters} /> : (
            <div className="favorites-grid">
              {favoritesToShow.map((favorite) => (
                <FavoriteCard
                  key={favorite.id}
                  favorite={favorite}
                  onEdit={setEditingFavorite}
                  onRemove={setFavoriteToRemove}
                />
              ))}
            </div>
          )}

          {visibleFavorites.length > 0 && (
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} label="Favorites pagination" />
          )}
        </>
      )}

      {editingFavorite && (
        <FavoriteModal
          pokemon={editingFavorite}
          appearance={editingFavorite.appearance}
          image={editingFavorite.image}
          existingFavorite={editingFavorite}
          onClose={() => setEditingFavorite(null)}
          onSave={editFavorite}
        />
      )}

      {favoriteToRemove && (
        <ConfirmModal
          title={`Remove ${capitalize(favoriteToRemove.name)}?`}
          message="This Pokémon will be removed from your favorites."
          confirmLabel="Remove favorite"
          onCancel={() => setFavoriteToRemove(null)}
          onConfirm={confirmFavoriteRemoval}
        />
      )}
    </section>
  );
}

export default Favorites;
