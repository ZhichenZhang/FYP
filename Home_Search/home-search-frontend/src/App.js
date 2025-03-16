import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import PropertyList from './components/PropertyList';
import Favorites from './components/Favorites';
import Profile from './components/Profile';
import ChatBot from './components/ChatBot';
import ChatBotToggle from './components/ChatBotToggle';
import Footer from './components/Footer';      
import BackToTop from './components/BackToTop'; 
import axios from 'axios';
import './index.css'; 


const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8080'
  : 'https://backend-home-search.fly.dev';

function App() {
  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState(new Set());
  const [properties, setProperties] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Holds the chatbot-generated filter (e.g., "house under 300k"), 
  // so PropertyList knows what to search
  const [chatbotFilter, setChatbotFilter] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // On Mount: Fetch properties (for ChatBot + Favorites) + Load favorites
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch a larger set of properties so the chatbot has more data
    const fetchAllProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties`, {
          params: { limit: 100 }
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Whenever favorites changes, save them to localStorage
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('propertyFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Favorite Toggling
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Chat / Property Selection
  // ─────────────────────────────────────────────────────────────────────────────
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handlePropertySelected = (property) => {
    setSelectedProperty(property);
    const element = document.getElementById(`property-${property.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-property');
      setTimeout(() => {
        element.classList.remove('highlight-property');
      }, 2000);
    }
  };

  // If chatbot wants to filter the listing by a query (e.g., "house 3 bed under 300k")
  const handleChatbotFilter = (filter) => {
    setChatbotFilter(filter);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Main Return
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Router>
      <div 
        className="app-container"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh' 
        }}
      >
        {/* NavBar at top */}
        <NavBar />

        {/* Main content area */}
        <div 
          className="main-container" 
          style={{ flex: 1 }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <PropertyList
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  chatbotFilter={chatbotFilter}    // <--- Pass ChatBot filter
                />
              }
            />
            <Route
              path="/properties"
              element={
                <PropertyList
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  chatbotFilter={chatbotFilter}    // <--- Pass ChatBot filter
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
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        {/* Footer at bottom */}
        <Footer />

        {/* ChatBot + Toggle */}
        {isChatOpen && (
          <ChatBot
            properties={properties}
            onPropertySelected={handlePropertySelected}
            onFilterProperties={handleChatbotFilter} // <--- so ChatBot sets filter
          />
        )}
        <ChatBotToggle 
          isOpen={isChatOpen} 
          toggleChat={toggleChat} 
        />

        {/* Optional "Back to Top" button */}
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
