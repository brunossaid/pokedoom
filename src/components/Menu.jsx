import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeWhenClickingOutside(event) {
      if (
        !menuRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeWhenClickingOutside);
    return () => {
      document.removeEventListener('pointerdown', closeWhenClickingOutside);
    };
  }, [isOpen]);

  return (
    <>
      <nav
        ref={menuRef}
        id="main-navigation"
        className={`bottom-menu ${isOpen ? 'open' : ''}`}
      >
        <div className="menu-grid">
          <NavLink to="/pokedex" onClick={() => setIsOpen(false)}>
            <img className="menu-icon" src="/images/icons/pokedex.png" alt="" />
            <span className="menu-label">Pokedex</span>
          </NavLink>

          <NavLink to="/favorites" onClick={() => setIsOpen(false)}>
            <img
              className="menu-icon"
              src="/images/icons/favorites.png"
              alt=""
            />
            <span className="menu-label">Favorites</span>
          </NavLink>

          <NavLink to="/history" onClick={() => setIsOpen(false)}>
            <img className="menu-icon" src="/images/icons/history.png" alt="" />
            <span className="menu-label">History</span>
          </NavLink>

          <NavLink to="/contact" onClick={() => setIsOpen(false)}>
            <img className="menu-icon" src="/images/icons/contact.png" alt="" />
            <span className="menu-label">Contact</span>
          </NavLink>
        </div>
        <ThemeToggle />
      </nav>

      <button
        ref={buttonRef}
        type="button"
        className="pokeball-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
      >
        <img
          className={isOpen ? 'pokeball-open' : 'pokeball-closed'}
          src={isOpen ? '/images/blackball-open.png' : '/images/blackball.png'}
          alt=""
        />
      </button>
    </>
  );
}

export default Menu;
