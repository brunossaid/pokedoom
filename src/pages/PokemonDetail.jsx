import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { capitalize } from '../utils/textUtils';
import FavoriteModal from '../components/FavoriteModal';
import { useFavorites } from '../hooks/useFavorites';
import { usePokemonDetails } from '../hooks/usePokemonDetails';
import {
  PokemonBasicData,
  PokemonDefenses,
  PokemonEvolutions,
  PokemonStats,
} from '../components/pokemon-detail/DetailSections';

function formatPokemonName(value) {
  return value.split('-').map(capitalize).join(' ');
}

function PokemonDetail() {
  const { name } = useParams();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/pokedex';
  const [showFavoriteForm, setShowFavoriteForm] = useState(false);
  const [favoriteConfirmation, setFavoriteConfirmation] = useState('');
  const { favorites, saveFavorite: persistFavorite } = useFavorites();
  const {
    pokemon,
    species,
    selectedAppearance,
    setSelectedAppearance,
    forms,
    loading,
    error,
    retryPokemon,
    evolutionChain,
    specialForms,
    evolutionLoading,
    evolutionError,
    retryEvolution,
    defenses,
    defensesLoading,
    defensesError,
    retryDefenses,
  } = usePokemonDetails(name);

  if (loading) {
    return (
      <div className="loading-dots" role="status" aria-label="Loading Pokémon details">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state" role="alert">
        <p>{error}</p>
        <button
          type="button"
          onClick={retryPokemon}
        >
          Try again
        </button>
        <Link className="detail-back-link" to={returnTo}>
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const defaultImage =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default ||
    '/images/image-fallback.png';
  const femaleImage = pokemon.sprites.other.home.front_female || pokemon.sprites.front_female;
  const shinyImage =
    pokemon.sprites.other['official-artwork'].front_shiny ||
    pokemon.sprites.other.home.front_shiny ||
    pokemon.sprites.front_shiny;
  const shinyFemaleImage =
    pokemon.sprites.other.home.front_shiny_female || pokemon.sprites.front_shiny_female;
  const standardAppearanceImages = {
    default: defaultImage,
    female: femaleImage,
    shiny: shinyImage,
    'shiny-female': shinyFemaleImage,
  };
  const formAppearanceImages = Object.fromEntries(
    forms.flatMap((form) => [
      [`form:${form.name}`, form.image],
      [`form:${form.name}:shiny`, form.shinyImage],
    ]).filter(([, formImage]) => formImage)
  );
  const appearanceImages = { ...standardAppearanceImages, ...formAppearanceImages };
  const image = appearanceImages[selectedAppearance] || defaultImage;
  const isShiny = selectedAppearance === 'shiny' || selectedAppearance.endsWith(':shiny');
  const selectedFormName = selectedAppearance.startsWith('form:')
    ? selectedAppearance.slice('form:'.length).replace(/:shiny$/, '')
    : null;
  const selectedForm = forms.find((form) => form.name === selectedFormName);
  const favoriteName = selectedForm?.name || pokemon.name;
  const favoriteId = `${pokemon.name}:${selectedAppearance}`;
  const existingFavorite = favorites.find((favorite) => favorite.id === favoriteId);

  function saveFavorite(formValues) {
    const wasAlreadySaved = Boolean(existingFavorite);
    const favorite = {
      id: favoriteId,
      pokemonId: pokemon.id,
      name: favoriteName,
      pokemonName: pokemon.name,
      appearance: selectedAppearance,
      image,
      isShiny,
      ...formValues,
      savedAt: new Date().toISOString(),
    };
    persistFavorite(favorite);
    setShowFavoriteForm(false);
    setFavoriteConfirmation(
      `${formatPokemonName(favoriteName)} was ${wasAlreadySaved ? 'updated in' : 'added to'} your favorites.`
    );
  }
  const englishDescriptions = species.flavor_text_entries.filter(
    ({ language }) => language.name === 'en'
  );
  const description = englishDescriptions
    .at(-1)
    ?.flavor_text.replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const genus = species.genera.find(({ language }) => language.name === 'en')?.genus;
  const isGenderless = species.gender_rate === -1;
  const femalePercentage = isGenderless ? 0 : (species.gender_rate / 8) * 100;
  const malePercentage = 100 - femalePercentage;

  return (
    <article className="pokemon-detail">
      <Link className="detail-back-link" to={returnTo}>
        ← Back to Pokédex
      </Link>

      <section className="detail-hero" aria-labelledby="pokemon-detail-name">
        <div className="detail-image-panel">
          <div className="detail-image-frame">
            {isShiny && <span className="shiny-badge">✦ SHINY</span>}
            <img src={image} alt={`${pokemon.name}${isShiny ? ' shiny' : ''}`} />
          </div>
          <div className="gender-form-toggle" aria-label="Choose Pokémon appearance">
            {forms.length > 1 ? forms.map((form) => (
              <button
                type="button"
                className={selectedForm?.name === form.name ? 'active' : ''}
                onClick={() => setSelectedAppearance(
                  `form:${form.name}${isShiny && form.shinyImage ? ':shiny' : ''}`
                )}
                aria-pressed={selectedForm?.name === form.name}
                key={form.name}
              >
                {formatPokemonName(form.label)}
              </button>
            )) : (
            <button
              type="button"
              className={selectedAppearance === 'default' ? 'active' : ''}
              onClick={() => setSelectedAppearance('default')}
              aria-pressed={selectedAppearance === 'default'}
            >
              Default
            </button>
            )}
            {forms.length <= 1 && femaleImage && (
              <button
                type="button"
                className={selectedAppearance === 'female' ? 'active' : ''}
                onClick={() => setSelectedAppearance('female')}
                aria-pressed={selectedAppearance === 'female'}
              >
                Female
              </button>
            )}
            {forms.length <= 1 && shinyImage && (
              <button
                type="button"
                className={selectedAppearance === 'shiny' ? 'active shiny-option' : 'shiny-option'}
                onClick={() => setSelectedAppearance('shiny')}
                aria-pressed={selectedAppearance === 'shiny'}
              >
                ✦ Shiny
              </button>
            )}
            {forms.length <= 1 && shinyFemaleImage && (
              <button
                type="button"
                className={
                  selectedAppearance === 'shiny-female'
                    ? 'active shiny-option'
                    : 'shiny-option'
                }
                onClick={() => setSelectedAppearance('shiny-female')}
                aria-pressed={selectedAppearance === 'shiny-female'}
              >
                ✦ Shiny female
              </button>
            )}
            {forms.length > 1 && selectedForm?.shinyImage && (
              <button
                type="button"
                className={isShiny ? 'active shiny-option' : 'shiny-option'}
                onClick={() => setSelectedAppearance(
                  isShiny ? `form:${selectedForm.name}` : `form:${selectedForm.name}:shiny`
                )}
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
              <span className={`pokemon-type type-${type.name}`} key={type.name}>
                {capitalize(type.name)}
              </span>
            ))}
          </div>
          {description && <p className="pokemon-description">{description}</p>}
          <button
            type="button"
            className="add-favorite-button"
            aria-label={`${existingFavorite ? 'Edit' : 'Add'} ${pokemon.name} ${selectedAppearance} favorite`}
            onClick={() => setShowFavoriteForm(true)}
          >
            <span aria-hidden="true">♥</span>
            {existingFavorite ? 'Edit favorite' : 'Add to favorites'}
          </button>
          {favoriteConfirmation && (
            <div className="favorite-save-confirmation" role="status">
              <span aria-hidden="true">✓</span>
              {favoriteConfirmation}
            </div>
          )}
        </div>
      </section>

      {showFavoriteForm && (
        <FavoriteModal
          pokemon={pokemon}
          appearance={selectedAppearance}
          image={image}
          existingFavorite={existingFavorite}
          onClose={() => setShowFavoriteForm(false)}
          onSave={saveFavorite}
        />
      )}

      <PokemonBasicData
        pokemon={pokemon}
        species={species}
        malePercentage={malePercentage}
        femalePercentage={femalePercentage}
        isGenderless={isGenderless}
      />
      <PokemonStats stats={pokemon.stats} />
      <PokemonDefenses
        defenses={defenses}
        loading={defensesLoading}
        error={defensesError}
        onRetry={retryDefenses}
      />
      <PokemonEvolutions
        chain={evolutionChain}
        specialForms={specialForms}
        currentPokemon={pokemon.name}
        returnTo={returnTo}
        loading={evolutionLoading}
        error={evolutionError}
        onRetry={retryEvolution}
      />

    </article>
  );
}

export default PokemonDetail;
