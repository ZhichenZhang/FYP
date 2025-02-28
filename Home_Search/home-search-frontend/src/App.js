import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import PropertyList from './components/PropertyList';
import Favorites from './components/Favorites';
import ChatBot from './components/ChatBot';
import ChatBotToggle from './components/ChatBotToggle';
import axios from 'axios';

function App() {
  const [favorites, setFavorites] = useState(new Set());
  const [properties, setProperties] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  useEffect(() => {
    // Load all properties for the chatbot to have access to
    const fetchAllProperties = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/properties', {
          params: { limit: 100 }, // Fetch more properties for the chatbot to work with
        });
        const propertiesWithIds = (response.data.properties || []).map(property => ({
          ...property,
          id: property.id || property._id || property.address.replace(/\s+/g, '-').toLowerCase()
        }));
        setProperties(propertiesWithIds);
      } catch (err) {
        console.error('Error fetching properties:', err);
      }
    };
    fetchAllProperties();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('propertyFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('propertyFavorites', JSON.stringify([...favorites]));
  }, [favorites]);
  
  const handleFavoriteToggle = (propertyId) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };
  
  const handlePropertySelected = (property) => {
    setSelectedProperty(property);
    // You could use this to scroll to the property or navigate to its detail page
    console.log("Selected property:", property);
    
    // Optional: Scroll to the property if it's in the current view
    // This requires adding id attributes to your PropertyCard components
    const element = document.getElementById(`property-${property.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.classList.add('highlight-property');
      setTimeout(() => {
        element.classList.remove('highlight-property');
      }, 2000);
    }
  };
  
  const handlePropertiesFiltered = (filteredProps) => {
    setFilteredProperties(filteredProps);
    // Optionally, scroll to the property list
    document.querySelector('.property-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilteredProperties(null);
  };
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route 
            path="/" 
            element={
              <PropertyList 
                favorites={favorites} 
                onFavoriteToggle={handleFavoriteToggle} 
                filteredProperties={filteredProperties}
                onClearFilters={handleClearFilters}
              />
            } 
          />
          <Route 
            path="/properties" 
            element={
              <PropertyList 
                favorites={favorites} 
                onFavoriteToggle={handleFavoriteToggle} 
                filteredProperties={filteredProperties}
                onClearFilters={handleClearFilters}
              />
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <Favorites 
                properties={properties}
                favorites={favorites} 
                onFavoriteToggle={handleFavoriteToggle} 
              />
            } 
          />
          <Route path="/profile" element={<div>Profile Page Coming Soon</div>} />
        </Routes>
        
        {isChatOpen && (
          <ChatBot 
            properties={properties} 
            onPropertySelected={handlePropertySelected}
            onPropertiesFiltered={handlePropertiesFiltered}
          />
        )}
        <ChatBotToggle isOpen={isChatOpen} toggleChat={toggleChat} />
      </div>
    </Router>
  );
}

export default App;