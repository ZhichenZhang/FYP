import React from 'react';
import './NavBar.css';

function NavBar() {
  return (
    <div className="header">
      <h1>Home Search</h1>
      <ul className="header-links">
        <li><a href="#properties">Properties</a></li>
        <li><a href="#profile">My Profile</a></li>
      </ul>
    </div>
  );
}

export default NavBar;
