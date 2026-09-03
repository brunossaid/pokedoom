import { Link } from 'react-router-dom';
import PokemonCard from '../components/PokemonCard';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { capitalize } from '../utils/textUtils';
import { useRandomPokemon } from '../hooks/useRandomPokemon';
import { useHistory } from '../hooks/useHistory';
import { handleImageError } from '../utils/imageFallback';

function Home() {
  const { history } = useHistory();
  const {
    pokemon: randomPokemon,
    species: randomSpecies,
    loading: featuredLoading,
    error: featuredError,
    retry: retryFeatured,
  } = useRandomPokemon();

  return (
    <div className="home-container">
      <section className="home-welcome" aria-labelledby="home-welcome-title">
        <small>WELCOME, TRAINER</small>
        <h2 id="home-welcome-title">Explore. Discover. Build your team.</h2>
        <p>
          Search every Pokémon, learn about their types and evolutions, save
          your favorites and keep track of your discoveries.
        </p>
        <div className="home-welcome-actions">
          <Link to="/pokedex">Explore Pokédex</Link>
          <Link to="/favorites">View Favorites</Link>
        </div>
      </section>

      <section className="home-featured">
        <h2>Discover a Pokémon</h2>

        {featuredLoading ? (
          <LoadingState label="Discovering a Pokémon" />
        ) : featuredError ? (
          <ErrorState message={featuredError} onRetry={retryFeatured} />
        ) : randomPokemon && randomSpecies ? (
          <div className="daily-pokemon-card">
            <button
              type="button"
              className="refresh-button"
              onClick={retryFeatured}
            >
              <span className="refresh-icon">↻</span>
              <span className="refresh-text">View another</span>
            </button>

            <img
              className="daily-pokemon-image"
              width="140"
              height="140"
              fetchPriority="high"
              onError={handleImageError}
              src={
                randomPokemon.sprites.other?.showdown?.front_default ||
                randomPokemon.sprites.other?.['official-artwork']
                  ?.front_default ||
                randomPokemon.sprites.front_default ||
                '/images/image-fallback.png'
              }
              alt={randomPokemon.name}
            />

            <div className="daily-pokemon-info">
              <span>#{randomPokemon.id}</span>

              <h2>{capitalize(randomPokemon.name)}</h2>

              <div className="detail-types">
                {randomPokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`pokemon-type type-${type.type.name}`}
                  >
                    {capitalize(type.type.name)}
                  </span>
                ))}
              </div>

              <p>
                {randomSpecies.flavor_text_entries
                  .find((entry) => entry.language.name === 'en')
                  ?.flavor_text.replace(/\f|\n/g, ' ')}
              </p>

              <Link
                to={`/pokemon/${randomPokemon.name}`}
                state={{ returnTo: '/' }}
              >
                View details
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="home-collection">
        <h2>Recently viewed</h2>

        {history.length > 0 ? (
          <>
            <div className="home-history-grid">
              {history.slice(0, 4).map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} returnTo="/" />
              ))}
            </div>

            <Link to="/history" className="home-section-link">
              View history
            </Link>
          </>
        ) : (
          <p>No Pokémon viewed yet.</p>
        )}
      </section>
    </div>
  );
}

export default Home;
