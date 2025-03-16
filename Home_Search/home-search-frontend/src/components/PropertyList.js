import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import './PropertyList.css';

function PropertyList({ 
  favorites, 
  onFavoriteToggle, 
  chatbotFilter = null  // Receives filter text from the chatbot
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [properties, setProperties] = useState([]);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8080'
  : 'https://backend-home-search.fly.dev';

  // How many items to fetch per page
  const limit = 12;

  // Whenever chatbotFilter changes, set that as our active search term
  useEffect(() => {
    if (chatbotFilter) {
      setSearchTerm(chatbotFilter);
      setPage(1);
    }
  }, [chatbotFilter]);

  // Fetch properties from the backend whenever page or searchTerm changes
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties`, {
          params: { page, limit, searchTerm },
        });
        const propertiesWithIds = (response.data.properties || []).map(property => ({
          ...property,
          id: property.id 
            || property._id 
            || property.address.replace(/\s+/g, '-').toLowerCase()
        }));
        setProperties(propertiesWithIds);
        setTotalPages(Math.ceil(response.data.total / limit));
      } catch (err) {
        setError('Error fetching properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [page, searchTerm]);

  // Pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User typing in the search bar
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Clear the filter (resets searchTerm -> fetches all results again)
  const handleClearFilter = () => {
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="property-list">
      <h1 className="title">Find Your Dream Home</h1>
      
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search properties..."
        />

        {searchTerm && (
          <button 
            className="clear-button" 
            onClick={handleClearFilter}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {properties.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p>No properties found matching your search.</p>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.has(property.id)}
                  onFavoriteToggle={() => onFavoriteToggle(property.id)}
                />
              ))}
            </div>
          )}
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default PropertyList;
