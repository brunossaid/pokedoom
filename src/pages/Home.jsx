import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPokemonDetails, getPokemonSpecies } from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { getHistory } from '../services/historyStorage';
import { getFavorites } from '../services/favoritesStorage';
import { capitalize } from '../utils/textUtils';

function Home() {
  const [randomPokemon, setRandomPokemon] = useState(null);
  const [randomSpecies, setRandomSpecies] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function loadRandomPokemon() {
      const randomId = Math.floor(Math.random() * 1025) + 1;

      const pokemonData = await getPokemonDetails(randomId);
      const speciesData = await getPokemonSpecies(pokemonData.name);

      setRandomPokemon(pokemonData);
      setRandomSpecies(speciesData);
    }

    loadRandomPokemon();

    setHistory(getHistory());
    setFavorites(getFavorites());
  }, []);

  return (
    <div className="home-container">
      <section className="home-featured">
        <h2>Discover a Pokémon</h2>
        {randomPokemon && randomSpecies && (
          <div className="daily-pokemon-card">
            <img
              className="daily-pokemon-image"
              src={
                randomPokemon.sprites.other['official-artwork'].front_default ||
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

              <Link to={`/pokemon/${randomPokemon.name}`}>View details</Link>
            </div>
          </div>
        )}
      </section>

      <Link to="/pokedex" className="home-pokedex-link">
        Explore Pokédex
      </Link>

      <section>
        <h2>Recently viewed</h2>

        {history.length > 0 ? (
          <>
            <div className="home-history-grid">
              {history.slice(0, 3).map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
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
