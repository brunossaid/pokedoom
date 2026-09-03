import { Link } from 'react-router-dom';
import { capitalize } from '../../utils/textUtils';
import { handleImageError } from '../../utils/imageFallback';

function FavoriteCard({ favorite, onEdit, onRemove }) {
  return (
    <article className="favorite-card">
      <div className="favorite-card-image">
        {favorite.isShiny && <span>✦ SHINY</span>}
        <img src={favorite.image} alt={`${favorite.name} ${favorite.appearance}`} onError={handleImageError} />
      </div>
      <div className="favorite-card-content">
        <div className="favorite-card-title">
          <div><small>#{favorite.pokemonId}</small><h3>{capitalize(favorite.name)}</h3></div>
          <strong>{favorite.rating}</strong>
        </div>
        <span className="favorite-custom-tag">{favorite.tag}</span>
        <small className="favorite-appearance">
          {favorite.appearance.split('-').map(capitalize).join(' ')} appearance
        </small>
        {favorite.note && <p>{favorite.note}</p>}
        <div className="favorite-card-actions">
          <Link to={`/pokemon/${favorite.pokemonName || favorite.name}`} state={{ returnTo: '/favorites' }}>View details</Link>
          <button type="button" onClick={() => onEdit(favorite)}>Edit</button>
          <button type="button" className="remove-favorite" onClick={() => onRemove(favorite)}>Remove</button>
        </div>
      </div>
    </article>
  );
}

export default FavoriteCard;
