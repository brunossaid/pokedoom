import FavoriteModal from '../FavoriteModal';
import { capitalize, formatPokemonName } from '../../utils/textUtils';
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
            className="appearance-controls"
            aria-label="Choose Pokémon appearance"
          >
            {forms.length > 1 ? (
              <>
                {forms.map((form) => (
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
                ))}

                {selectedForm?.shinyImage && (
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
              </>
            ) : (
              <>
                {shinyImage && (
                  <div className="appearance-group">
                    <button
                      type="button"
                      className={!isShiny ? 'active' : ''}
                      onClick={() =>
                        setAppearance(
                          appearance === 'female' ||
                            appearance === 'shiny-female'
                            ? 'female'
                            : 'default'
                        )
                      }
                    >
                      Default
                    </button>

                    <button
                      type="button"
                      className={
                        isShiny ? 'active shiny-option' : 'shiny-option'
                      }
                      onClick={() =>
                        setAppearance(
                          appearance === 'female' ||
                            appearance === 'shiny-female'
                            ? 'shiny-female'
                            : 'shiny'
                        )
                      }
                    >
                      ✦ Shiny
                    </button>
                  </div>
                )}

                {femaleImage && (
                  <div className="appearance-group appearance-gender">
                    <button
                      type="button"
                      className={
                        appearance === 'default' || appearance === 'shiny'
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setAppearance(isShiny ? 'shiny' : 'default')
                      }
                      aria-label="Male"
                      aria-pressed={
                        appearance === 'default' || appearance === 'shiny'
                      }
                    >
                      <span className="gender-male" aria-hidden="true">
                        ♂
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        appearance === 'female' || appearance === 'shiny-female'
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setAppearance(isShiny ? 'shiny-female' : 'female')
                      }
                      aria-label="Female"
                      aria-pressed={
                        appearance === 'female' || appearance === 'shiny-female'
                      }
                    >
                      <span className="gender-female" aria-hidden="true">
                        ♀
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="detail-heading">
          <span>#{String(pokemon.id).padStart(4, '0')}</span>
          <h2 id="pokemon-detail-name">{formatPokemonName(pokemon.name)}</h2>
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
