import React from 'react';
import './NavBar.css';

function NavBar() {
  return (
    <header className="header">
      <h1 className="header-title">Home Search</h1>
      <ul className="header-links">
        <li>
          <a href="#properties">Properties</a>
        </li>
        <li>
          <a href="#favorites">Favorites</a>
        </li>
        <li>
          <a href="#profile">My Profile</a>
        </li>
      </ul>
    </header>
  );
}

export default NavBar;
