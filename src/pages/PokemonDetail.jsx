import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { capitalize } from '../utils/textUtils';
import PokemonDetailHero from '../components/pokemon-detail/PokemonDetailHero';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { useFavorites } from '../hooks/useFavorites';
import { usePokemonDetails } from '../hooks/usePokemonDetails';
import { getPokemonAppearance } from '../utils/pokemonAppearance';
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
  const backLabel = returnTo === '/'
    ? 'Back to Home'
    : returnTo === '/history'
      ? 'Back to History'
      : returnTo === '/favorites'
        ? 'Back to Favorites'
        : 'Back to Pokédex';
  const [showFavoriteForm, setShowFavoriteForm] = useState(false);
  const [favoriteConfirmation, setFavoriteConfirmation] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
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

  if (loading && !pokemon) {
    return <LoadingState label="Loading Pokémon details" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={retryPokemon}>
        <Link className="detail-back-link" to={returnTo}>
          {backLabel}
        </Link>
      </ErrorState>;
  }

  const {
    image, fallbackImage, femaleImage, shinyImage, shinyFemaleImage, isShiny,
    selectedForm, favoriteName, favoriteId,
  } = getPokemonAppearance(pokemon, forms, selectedAppearance);
  const existingFavorite = favorites.find(
    (favorite) => favorite.id === favoriteId
  );

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
    const saved = persistFavorite(favorite);

    if (!saved) {
      setFavoriteError(
        'Unable to save this favorite. Check your browser storage and try again.'
      );
      return;
    }

    setShowFavoriteForm(false);
    setFavoriteError('');
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
  const genus = species.genera.find(
    ({ language }) => language.name === 'en'
  )?.genus;
  const isGenderless = species.gender_rate === -1;
  const femalePercentage = isGenderless ? 0 : (species.gender_rate / 8) * 100;
  const malePercentage = 100 - femalePercentage;
  const hasBothGenders = malePercentage > 0 && femalePercentage > 0;

  return (
    <article className="pokemon-detail" aria-busy={loading}>
      {loading && (
        <LoadingState
          label="Loading next Pokémon"
          className="detail-transition-loading"
        />
      )}
      <Link className="detail-back-link" to={returnTo}>
        ← {backLabel}
      </Link>

      <PokemonDetailHero pokemon={pokemon} forms={forms} appearance={selectedAppearance}
        setAppearance={setSelectedAppearance} selectedForm={selectedForm} image={image}
        fallbackImage={fallbackImage}
        femaleImage={femaleImage} shinyImage={shinyImage} shinyFemaleImage={shinyFemaleImage}
        hasBothGenders={hasBothGenders}
        isShiny={isShiny} genus={genus} description={description} existingFavorite={existingFavorite}
        confirmation={favoriteConfirmation} error={favoriteError} showForm={showFavoriteForm}
        onOpenForm={() => { setFavoriteError(''); setFavoriteConfirmation(''); setShowFavoriteForm(true); }}
        onCloseForm={() => { setShowFavoriteForm(false); setFavoriteError(''); }} onSave={saveFavorite} />

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
