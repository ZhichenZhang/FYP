import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import './PropertyList.css';

function PropertyList({ favorites, onFavoriteToggle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [properties, setProperties] = useState([]);
  const limit = 12;

  useEffect(() => {
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="property-list">
      <h1 className="title">Find Your Dream Home</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search properties..."
        />
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
    </div>
  );
}

export default PropertyList;