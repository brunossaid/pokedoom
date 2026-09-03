import { useState } from 'react';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../utils/imageFallback';
import {
  formatDisplayName,
  formatEvolutionCondition,
  getEvolutionPriority,
} from './detailFormatters';

function EvolutionNode({ node, currentPokemon, returnTo }) {
  const [showAllMethods, setShowAllMethods] = useState(false);
  const uniqueDetails = node.evolutionDetails
    .filter(
      (detail, index, details) =>
        details.findIndex(
          (candidate) =>
            formatEvolutionCondition(candidate) ===
            formatEvolutionCondition(detail)
        ) === index
    )
    .sort((a, b) => getEvolutionPriority(a) - getEvolutionPriority(b));

  return (
    <div className="evolution-tree-node">
      {uniqueDetails.length > 0 && (
        <div className="evolution-condition">
          <span aria-hidden="true">↓</span>
          <ul className="evolution-options">
            <li>
              <small>
              {uniqueDetails[0].itemSprite && (
                <img src={uniqueDetails[0].itemSprite} alt="" onError={handleImageError} />
              )}
              {formatEvolutionCondition(uniqueDetails[0])}
              {uniqueDetails.length > 1 && (
                <button
                  type="button"
                  className="evolution-expand-button"
                  onClick={() => setShowAllMethods((current) => !current)}
                  aria-expanded={showAllMethods}
                  aria-label={showAllMethods ? 'Hide alternative evolution methods' : 'Show alternative evolution methods'}
                >
                  {showAllMethods ? '▴' : '▾'}
                </button>
              )}
              </small>
            </li>
            {showAllMethods && uniqueDetails.slice(1).map((detail, index) => (
              <li key={`${formatEvolutionCondition(detail)}-${index}`}>
                <small>
                  {detail.itemSprite && <img src={detail.itemSprite} alt="" onError={handleImageError} />}
                  {formatEvolutionCondition(detail)}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link
        className={`evolution-pokemon ${node.name === currentPokemon ? 'current' : ''}`}
        to={`/pokemon/${node.name}`}
        state={{ returnTo }}
        aria-current={node.name === currentPokemon ? 'page' : undefined}
      >
        <img src={node.image} alt="" onError={handleImageError} />
        <strong>{formatDisplayName(node.displayName || node.name)}</strong>
      </Link>
      {node.evolvesTo.length > 0 && (
        <div className="evolution-branches">
          {node.evolvesTo.map((evolution) => (
            <EvolutionNode key={evolution.key || evolution.name} node={evolution} currentPokemon={currentPokemon} returnTo={returnTo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EvolutionNode;
