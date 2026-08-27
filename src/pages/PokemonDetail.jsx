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
  const appearanceImages = {
    default: defaultImage,
    female: femaleImage,
    shiny: shinyImage,
    'shiny-female': shinyFemaleImage,
  };
  const image = appearanceImages[selectedAppearance] || defaultImage;
  const isShiny = selectedAppearance.startsWith('shiny');
  const favoriteId = `${pokemon.name}:${selectedAppearance}`;
  const existingFavorite = favorites.find((favorite) => favorite.id === favoriteId);

  function saveFavorite(formValues) {
    const wasAlreadySaved = Boolean(existingFavorite);
    const favorite = {
      id: favoriteId,
      pokemonId: pokemon.id,
      name: pokemon.name,
      appearance: selectedAppearance,
      image,
      isShiny,
      ...formValues,
      savedAt: new Date().toISOString(),
    };
    persistFavorite(favorite);
    setShowFavoriteForm(false);
    setFavoriteConfirmation(
      `${capitalize(pokemon.name)} was ${wasAlreadySaved ? 'updated in' : 'added to'} your favorites.`
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
            <button
              type="button"
              className={selectedAppearance === 'default' ? 'active' : ''}
              onClick={() => setSelectedAppearance('default')}
              aria-pressed={selectedAppearance === 'default'}
            >
              Default
            </button>
            {femaleImage && (
              <button
                type="button"
                className={selectedAppearance === 'female' ? 'active' : ''}
                onClick={() => setSelectedAppearance('female')}
                aria-pressed={selectedAppearance === 'female'}
              >
                Female
              </button>
            )}
            {shinyImage && (
              <button
                type="button"
                className={selectedAppearance === 'shiny' ? 'active shiny-option' : 'shiny-option'}
                onClick={() => setSelectedAppearance('shiny')}
                aria-pressed={selectedAppearance === 'shiny'}
              >
                ✦ Shiny
              </button>
            )}
            {shinyFemaleImage && (
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
        currentSpecies={pokemon.species.name}
        returnTo={returnTo}
        loading={evolutionLoading}
        error={evolutionError}
        onRetry={retryEvolution}
      />

    </article>
  );
}

export default PokemonDetail;
