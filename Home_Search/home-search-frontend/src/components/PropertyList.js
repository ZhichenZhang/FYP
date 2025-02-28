import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import './PropertyList.css';

function PropertyList({ favorites, onFavoriteToggle, filteredProperties, onClearFilters }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [properties, setProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const limit = 12;

  useEffect(() => {
    // Only fetch properties if we don't have filtered properties from chatbot
    if (filteredProperties === null) {
      fetchProperties();
    } else {
      // Use the filtered properties instead
      const propertiesWithIds = (filteredProperties || []).map(property => ({
        ...property,
        id: property.id || property._id || property.address.replace(/\s+/g, '-').toLowerCase()
      }));
      
      setProperties(propertiesWithIds);
      setTotalPages(Math.ceil(propertiesWithIds.length / limit));
      
      // Reset to first page when filters change
      if (page !== 1) {
        setPage(1);
      } else {
        // If already on page 1, update displayed properties
        updateDisplayedProperties(propertiesWithIds, 1);
      }
    }
  }, [filteredProperties]);

  // Handle pagination for both normal and filtered properties
  useEffect(() => {
    if (filteredProperties !== null) {
      // For filtered properties
      updateDisplayedProperties(properties, page);
    } else {
      // For regular API fetch
      fetchProperties();
    }
  }, [page]);

  const updateDisplayedProperties = (allProperties, currentPage) => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = allProperties.slice(startIndex, endIndex);
    setDisplayedProperties(paginatedProperties);
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/properties', {
        params: { page, limit, searchTerm },
      });
      const propertiesWithIds = (response.data.properties || []).map(property => ({
        ...property,
        id: property.id || property._id || property.address.replace(/\s+/g, '-').toLowerCase()
      }));
      setProperties([]);  // Clear previous properties
      setDisplayedProperties(propertiesWithIds);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (err) {
      setError('Error fetching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when search changes
    setPage(1);
    // Clear any filtered properties since we're doing a manual search
    if (onClearFilters && filteredProperties !== null) {
      onClearFilters();
    }
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
        
        {/* Show filter indicator and clear button if filters are applied */}
        {filteredProperties !== null && (
          <div className="filter-indicator">
            <span>Showing {filteredProperties.length} filtered properties</span>
            <button onClick={onClearFilters} className="clear-filter-button">
              Clear Filters
            </button>
          </div>
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
        <div className="property-grid">
          {filteredProperties !== null 
            ? displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.has(property.id)}
                  onFavoriteToggle={() => onFavoriteToggle(property.id)}
                />
              ))
            : displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.has(property.id)}
                  onFavoriteToggle={() => onFavoriteToggle(property.id)}
                />
              ))
          }
        </div>
      )}
      
      {/* Show pagination for both regular and filtered properties */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default PropertyList;