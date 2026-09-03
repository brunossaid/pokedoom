import { Link } from 'react-router-dom';
import { capitalize } from '../../utils/textUtils';
import { handleImageError } from '../../utils/imageFallback';
import EvolutionNode from './EvolutionNode';
import { formatDisplayName, formatSpecialRequirement } from './detailFormatters';

function PokemonEvolutions({ chain, specialForms, currentPokemon, returnTo, loading, error, onRetry }) {
  const chainNodes = Array.isArray(chain) ? chain : chain ? [chain] : [];

  return (
    <section className="detail-section" aria-labelledby="evolution-title">
      <h3 id="evolution-title">Evolution chain</h3>
      {loading ? (
        <p className="evolution-message" role="status">Loading evolution chain...</p>
      ) : error ? (
        <div className="evolution-message" role="alert"><p>{error}</p><button type="button" onClick={onRetry}>Try again</button></div>
      ) : (
        <>
          {chainNodes.length > 0 ? (
            <div className="evolution-tree" tabIndex="0" aria-label="Evolution chain">
              <div className="evolution-branches evolution-roots">
                {chainNodes.map((node) => (
                  <EvolutionNode key={node.key || node.name} node={node} currentPokemon={currentPokemon} returnTo={returnTo} />
                ))}
              </div>
            </div>
          ) : <p className="evolution-message">This Pokémon does not evolve.</p>}
          {specialForms.length > 0 && (
            <div className="special-forms">
              <h4>Special forms</h4>
              <div className="special-forms-grid">
                {specialForms.map((form) => (
                  <Link
                    className="special-form-card"
                    to={`/pokemon/${form.name}`}
                    state={{ returnTo, scrollToTopFor: form.name }}
                    key={form.name}
                  >
                    <small>{form.category}</small>
                    <img src={form.image} alt="" onError={handleImageError} />
                    <strong>{formatDisplayName(form.name)}</strong>
                    {form.requirements.length > 0 && (
                      <div className="special-form-requirements">
                        {form.requirements.map((requirement) => (
                          <span key={`${requirement.trigger}-${requirement.name || 'condition'}`}>
                            {requirement.sprite && <img src={requirement.sprite} alt="" onError={handleImageError} />}
                            {formatSpecialRequirement(requirement)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="special-form-types">
                      {form.types.map((type) => (
                        <span className={`pokemon-type effectiveness-type type-${type}`} key={type}>{capitalize(type)}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default PokemonEvolutions;
