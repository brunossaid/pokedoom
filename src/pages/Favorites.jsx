import { useState } from 'react';
import { Link } from 'react-router-dom';
import FavoriteModal from '../components/FavoriteModal';
import ConfirmModal from '../components/ConfirmModal';
import { capitalize } from '../utils/textUtils';
import { useFavorites } from '../hooks/useFavorites';

const FAVORITES_PER_PAGE = 6;

function Favorites() {
  const { favorites, saveFavorite, removeFavorite } = useFavorites();
  const [editingFavorite, setEditingFavorite] = useState(null);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [priorityDraft, setPriorityDraft] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [favoriteToRemove, setFavoriteToRemove] = useState(null);

  const sortedFavorites = [...favorites].sort(
    (first, second) => first.priority - second.priority || first.name.localeCompare(second.name)
  );
  const priorities = [...new Set(favorites.map((favorite) => favorite.priority))].sort(
    (first, second) => first - second
  );
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFavorites = sortedFavorites.filter((favorite) => {
    const matchesSearch =
      !normalizedSearch ||
      favorite.name.toLowerCase().includes(normalizedSearch) ||
      favorite.tag.toLowerCase().includes(normalizedSearch);
    const matchesPriority =
      !selectedPriority || favorite.priority === Number(selectedPriority);

    return matchesSearch && matchesPriority;
  });
  const totalPages = Math.max(1, Math.ceil(visibleFavorites.length / FAVORITES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const favoritesToShow = visibleFavorites.slice(
    (currentPage - 1) * FAVORITES_PER_PAGE,
    currentPage * FAVORITES_PER_PAGE
  );

  function editFavorite(formValues) {
    saveFavorite({
      ...editingFavorite,
      ...formValues,
      savedAt: new Date().toISOString(),
    });
    setEditingFavorite(null);
  }

  function confirmFavoriteRemoval() {
    removeFavorite(favoriteToRemove.id);
    setFavoriteToRemove(null);
  }

  function submitSearch(event) {
    event.preventDefault();
    setSearch(searchDraft);
    setSelectedPriority(priorityDraft);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setSearchDraft('');
    setSelectedPriority('');
    setPriorityDraft('');
    setPage(1);
  }

  return (
    <section className="favorites-page" aria-labelledby="favorites-title">
      <header className="favorites-heading">
        <div>
          <span aria-hidden="true">♥</span>
          <h2 id="favorites-title">Your favorites</h2>
        </div>
        <p>Ordered from highest to lowest priority.</p>
      </header>

      {sortedFavorites.length === 0 ? (
        <div className="favorites-empty">
          <span aria-hidden="true">♡</span>
          <h3>No favorites yet</h3>
          <p>Explore the Pokédex and save the Pokémon you like most.</p>
          <Link to="/pokedex">Explore Pokédex</Link>
        </div>
      ) : (
        <>
          <form className="search-area favorites-search-area" onSubmit={submitSearch}>
            <div className="search-row">
              <input
                type="search"
                className="search-bar"
                placeholder="Search Pokémon or custom tag..."
                aria-label="Search favorites by Pokémon name or custom tag"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
              />

              <button type="submit" className="search-submit-button">
                Search
              </button>

              <button
                type="button"
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                aria-expanded={showFilters}
                aria-controls="favorite-filters"
              >
                {showFilters ? '▴' : '▾'}
              </button>
            </div>

            <div
              id="favorite-filters"
              className={`filters-menu ${showFilters ? 'open' : ''}`}
            >
              <select
                aria-label="Filter favorites by priority"
                value={priorityDraft}
                onChange={(event) => setPriorityDraft(event.target.value)}
              >
                <option value="">All priorities</option>
                {priorities.map((priority) => (
                  <option value={priority} key={priority}>
                    P{priority}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="results-summary" aria-live="polite">
            <strong>
              {visibleFavorites.length} favorite{visibleFavorites.length === 1 ? '' : 's'} found
            </strong>
            {(search || selectedPriority) && (
              <div className="applied-filters" aria-label="Applied filters">
                {search && <span>Search: {search}</span>}
                {selectedPriority && <span>Priority: P{selectedPriority}</span>}
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>

          {visibleFavorites.length === 0 ? (
            <div className="favorites-no-results" role="status">
              <p>No favorites match your search or priority filter.</p>
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear search and filters
              </button>
            </div>
          ) : (
          <div className="favorites-grid">
          {favoritesToShow.map((favorite) => (
            <article className="favorite-card" key={favorite.id}>
              <div className="favorite-card-image">
                {favorite.isShiny && <span>✦ SHINY</span>}
                <img src={favorite.image} alt={`${favorite.name} ${favorite.appearance}`} />
              </div>

              <div className="favorite-card-content">
                <div className="favorite-card-title">
                  <div>
                    <small>#{favorite.pokemonId}</small>
                    <h3>{capitalize(favorite.name)}</h3>
                  </div>
                  <strong aria-label={`Priority ${favorite.priority}`}>
                    P{favorite.priority}
                  </strong>
                </div>

                <span className="favorite-custom-tag">{favorite.tag}</span>
                <small className="favorite-appearance">
                  {favorite.appearance
                    .split('-')
                    .map(capitalize)
                    .join(' ')} appearance
                </small>
                {favorite.note && <p>{favorite.note}</p>}

                <div className="favorite-card-actions">
                  <Link
                    to={`/pokemon/${favorite.name}`}
                    state={{ returnTo: '/favorites' }}
                  >
                    View details
                  </Link>
                  <button type="button" onClick={() => setEditingFavorite(favorite)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="remove-favorite"
                    onClick={() => setFavoriteToRemove(favorite)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
          </div>
          )}

          {visibleFavorites.length > 0 && (
            <nav className="pagination" aria-label="Favorites pagination">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                aria-label="Go to first favorites page"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous favorites page"
              >
                ‹
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Go to next favorites page"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages}
                aria-label="Go to last favorites page"
              >
                »
              </button>
            </nav>
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
