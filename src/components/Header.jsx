import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Header() {
  const location = useLocation();
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
    <header className={`hero ${hideBorder ? 'no-border' : ''}`}>
      <Link to="/" className="hero-link">
        <h1>{title}</h1>
      </Link>
    </header>
  );
}

export default Header;
