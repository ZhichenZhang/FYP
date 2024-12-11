import React, { useState } from 'react';
import Navbar from './components/NavBar';
import PropertyList from './components/PropertyList';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('properties');
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (propertyId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(propertyId)
        ? prevFavorites.filter((id) => id !== propertyId)
        : [...prevFavorites, propertyId]
    );
  };

  const renderPage = () => {
    if (currentPage === 'properties') {
      return <PropertyList favorites={favorites} onFavoriteToggle={toggleFavorite} />;
    } else if (currentPage === 'profile') {
      return <Profile />;
    }
  };

  return (
    <div className="App">
      <Navbar onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
