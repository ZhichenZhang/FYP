import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <header className="header">
      <h1 className="header-title">Home Search</h1>
      <ul className="header-links">
        <li>
          <Link to="/properties">Properties</Link>
        </li>
        <li>
          <Link to="/favorites">Favorites</Link>
        </li>
        <li>
          <Link to="/profile">My Profile</Link>
        </li>
      </ul>
    </header>
  );
}

export default NavBar;