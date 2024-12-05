import React, { useState } from 'react';
import Navbar from './components/NavBar';
import PropertyList from './components/PropertyList';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('properties');

  const renderPage = () => {
    if (currentPage === 'properties') {
      return <PropertyList />;
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
