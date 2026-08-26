import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className={`bottom-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-grid">
          <NavLink to="/pokedex" onClick={() => setIsOpen(false)}>
            Pokedex
          </NavLink>

          <NavLink to="/favorites" onClick={() => setIsOpen(false)}>
            Favorites
          </NavLink>

          <NavLink to="/history" onClick={() => setIsOpen(false)}>
            History
          </NavLink>

          <NavLink to="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </NavLink>
        </div>
      </nav>

      <button className="pokeball-button" onClick={() => setIsOpen(!isOpen)}>
        <img
          className={isOpen ? 'pokeball-open' : 'pokeball-closed'}
          src={isOpen ? '/images/blackball-open.png' : '/images/blackball.png'}
        />
      </button>
    </>
  );
}

export default Menu;
