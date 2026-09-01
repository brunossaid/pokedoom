import FavoriteModal from '../FavoriteModal';
import { capitalize } from '../../utils/textUtils';
import { handleImageError } from '../../utils/imageFallback';

const displayName = (name) => name.split('-').map(capitalize).join(' ');

function PokemonDetailHero({
  pokemon,
  forms,
  appearance,
  setAppearance,
  selectedForm,
  image,
  femaleImage,
  shinyImage,
  shinyFemaleImage,
  isShiny,
  genus,
  description,
  existingFavorite,
  confirmation,
  error,
  showForm,
  onOpenForm,
  onCloseForm,
  onSave,
}) {
  return (
    <>
      <section className="detail-hero" aria-labelledby="pokemon-detail-name">
        <div className="detail-image-panel">
          <div className="detail-image-frame">
            {isShiny && <span className="shiny-badge">✦ SHINY</span>}
            <img
              src={image}
              alt={`${pokemon.name}${isShiny ? ' shiny' : ''}`}
              onError={handleImageError}
            />
          </div>
          <div
            className="gender-form-toggle"
            aria-label="Choose Pokémon appearance"
          >
            {forms.length > 1 ? (
              forms.map((form) => (
                <button
                  type="button"
                  className={selectedForm?.name === form.name ? 'active' : ''}
                  onClick={() =>
                    setAppearance(
                      `form:${form.name}${isShiny && form.shinyImage ? ':shiny' : ''}`
                    )
                  }
                  aria-pressed={selectedForm?.name === form.name}
                  key={form.name}
                >
                  {displayName(form.label)}
                </button>
              ))
            ) : (
              <button
                type="button"
                className={appearance === 'default' ? 'active' : ''}
                onClick={() => setAppearance('default')}
                aria-pressed={appearance === 'default'}
              >
                Default
              </button>
            )}
            {forms.length <= 1 && femaleImage && (
              <button
                type="button"
                className={appearance === 'female' ? 'active' : ''}
                onClick={() => setAppearance('female')}
                aria-pressed={appearance === 'female'}
              >
                Female
              </button>
            )}
            {forms.length <= 1 && shinyImage && (
              <button
                type="button"
                className={
                  appearance === 'shiny'
                    ? 'active shiny-option'
                    : 'shiny-option'
                }
                onClick={() => setAppearance('shiny')}
                aria-pressed={appearance === 'shiny'}
              >
                ✦ Shiny
              </button>
            )}
            {forms.length <= 1 && shinyFemaleImage && (
              <button
                type="button"
                className={
                  appearance === 'shiny-female'
                    ? 'active shiny-option'
                    : 'shiny-option'
                }
                onClick={() => setAppearance('shiny-female')}
                aria-pressed={appearance === 'shiny-female'}
              >
                ✦ Shiny female
              </button>
            )}
            {forms.length > 1 && selectedForm?.shinyImage && (
              <button
                type="button"
                className={isShiny ? 'active shiny-option' : 'shiny-option'}
                onClick={() =>
                  setAppearance(
                    isShiny
                      ? `form:${selectedForm.name}`
                      : `form:${selectedForm.name}:shiny`
                  )
                }
                aria-pressed={isShiny}
              >
                ✦ Shiny
              </button>
            )}
          </div>
        </div>
        <div className="detail-heading">
          <span>#{String(pokemon.id).padStart(4, '0')}</span>
          <h2 id="pokemon-detail-name">{capitalize(pokemon.name)}</h2>
          {genus && <p className="pokemon-genus">{genus}</p>}
          <div className="detail-types" aria-label="Pokémon types">
            {pokemon.types.map(({ type }) => (
              <span
                className={`pokemon-type type-${type.name}`}
                key={type.name}
              >
                {capitalize(type.name)}
              </span>
            ))}
          </div>
          {description && <p className="pokemon-description">{description}</p>}
          <button
            type="button"
            className="add-favorite-button"
            aria-label={`${existingFavorite ? 'Edit' : 'Add'} ${pokemon.name} ${appearance} favorite`}
            onClick={onOpenForm}
          >
            <span aria-hidden="true">♥</span>
            {existingFavorite ? 'Edit favorite' : 'Add to favorites'}
          </button>
          {confirmation && (
            <div className="favorite-save-confirmation" role="status">
              <span aria-hidden="true">✓</span>
              {confirmation}
            </div>
          )}
          {error && (
            <div className="error-state detail-favorite-error" role="alert">
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>
      {showForm && (
        <FavoriteModal
          pokemon={pokemon}
          appearance={appearance}
          image={image}
          existingFavorite={existingFavorite}
          onClose={onCloseForm}
          onSave={onSave}
        />
      )}
    </>
  );
}

export default PokemonDetailHero;
