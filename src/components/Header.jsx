import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Header() {
  const location = useLocation();

  const titles = {
    '/': 'PokeDoom',
    '/pokedex': 'Pokedex',
    '/favorites': 'Favorites',
    '/history': 'History',
    '/contact': 'Contact',
  };

  const title = location.pathname.startsWith('/pokemon/')
    ? 'Pokémon Details'
    : titles[location.pathname] || 'PokeDoom';

  return (
    <header className="hero">
      <Link to="/" className="hero-link">
        <h1>{title}</h1>
      </Link>
      <ThemeToggle />
    </header>
  );
}

export default Header;
