import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllPokemon, preloadPokemonDetails } from '../api/pokeApi';
import { useFavorites } from '../hooks/useFavorites';

function Header() {
  const location = useLocation();
  const { favorites } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [pokemonNames, setPokemonNames] = useState([]);
  const [pokemonListFailed, setPokemonListFailed] = useState(false);
  const isPokemonDetail = location.pathname.startsWith('/pokemon/');
  const returnTo = location.state?.returnTo || '/pokedex';
  const isHistoryDetail = isPokemonDetail && returnTo === '/history';
  const isFavoritesDetail = isPokemonDetail && returnTo === '/favorites';
  const needsFullPokemonList =
    isPokemonDetail && !isHistoryDetail && !isFavoritesDetail;

  useEffect(() => {
    function handleScroll() {
      setScrolled((current) => {
        if (window.scrollY > 40) return true;
        if (window.scrollY <= 5) return false;

        return current;
      });
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!needsFullPokemonList || pokemonNames.length > 0) return undefined;

    let cancelled = false;

    getAllPokemon()
      .then(({ results }) => {
        if (!cancelled) {
          setPokemonNames(results.map(({ name }) => name));
          setPokemonListFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setPokemonListFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [needsFullPokemonList, pokemonNames.length]);

  const favoritePokemonNames = [
    ...new Set(
      [...favorites]
        .sort(
          (first, second) =>
            first.rating - second.rating ||
            first.name.localeCompare(second.name)
        )
        .map((favorite) => favorite.pokemonName || favorite.name)
    ),
  ];
  const navigationNames = isFavoritesDetail
    ? favoritePokemonNames
    : pokemonNames;
  const currentPokemonName = isPokemonDetail
    ? decodeURIComponent(location.pathname.split('/').at(-1))
    : '';
  const currentPokemonIndex = navigationNames.indexOf(currentPokemonName);
  const previousPokemonName =
    currentPokemonIndex > 0 ? navigationNames[currentPokemonIndex - 1] : null;
  const nextPokemonName =
    currentPokemonIndex >= 0 && currentPokemonIndex < navigationNames.length - 1
      ? navigationNames[currentPokemonIndex + 1]
      : null;
  const navigationIsLoading =
    needsFullPokemonList && pokemonNames.length === 0 && !pokemonListFailed;
  const navigationState = { ...location.state, returnTo };

  useEffect(() => {
    const neighbors = [previousPokemonName, nextPokemonName].filter(Boolean);

    neighbors.forEach((pokemonName) => {
      preloadPokemonDetails(pokemonName).catch(() => {});
    });
  }, [previousPokemonName, nextPokemonName]);

  const hideBorder =
    location.pathname === '/' || location.pathname === '/pokedex';

  const titles = {
    '/': 'PokeDoom',
    '/pokedex': 'Pokedex',
    '/favorites': 'Favorites',
    '/history': 'History',
    '/contact': 'Contact',
  };

  const title = location.pathname.startsWith('/pokemon/')
    ? 'Details'
    : titles[location.pathname] || 'PokeDoom';

  return (
    <header
      className={`hero ${hideBorder ? 'no-border' : ''} ${
        scrolled ? 'scrolled' : ''
      }`}
    >
      {isPokemonDetail &&
        !isHistoryDetail &&
        (previousPokemonName ? (
          <Link
            className="hero-arrow"
            to={`/pokemon/${previousPokemonName}`}
            state={navigationState}
            aria-label={`View previous Pokémon: ${previousPokemonName}`}
          >
            ‹
          </Link>
        ) : (
          <button
            type="button"
            className="hero-arrow"
            aria-label="Previous Pokémon unavailable"
            disabled
          >
            ‹
          </button>
        ))}

      <Link to="/" className="hero-link">
        <h1>{title}</h1>
      </Link>

      {isPokemonDetail &&
        !isHistoryDetail &&
        (nextPokemonName ? (
          <Link
            className="hero-arrow"
            to={`/pokemon/${nextPokemonName}`}
            state={navigationState}
            aria-label={`View next Pokémon: ${nextPokemonName}`}
          >
            ›
          </Link>
        ) : (
          <button
            type="button"
            className="hero-arrow"
            aria-label={
              navigationIsLoading
                ? 'Pokémon navigation is loading'
                : 'Next Pokémon unavailable'
            }
            disabled
          >
            ›
          </button>
        ))}
    </header>
  );
}

export default Header;
