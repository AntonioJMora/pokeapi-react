import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/img/bola-pokemon.png" alt="Logo PokeApi" />
        <h1>PokeApi</h1>
      </div>
      <nav>
        <ul className="nav-menu">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/favorites">Favoritos</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
