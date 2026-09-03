import { Link } from 'react-router-dom';

export function NoFavorites() {
  return (
    <div className="favorites-empty">
      <span aria-hidden="true">♡</span>
      <h3>No favorites yet</h3>
      <p>Explore the Pokédex and save the Pokémon you like most.</p>
      <Link to="/pokedex">Explore Pokédex</Link>
    </div>
  );
}

export function NoFavoriteResults({ onClear }) {
  return (
    <div className="favorites-no-results" role="status">
      <p>No favorites match your search or rating filter.</p>
      <button type="button" onClick={onClear}>Clear search and filters</button>
    </div>
  );
}
