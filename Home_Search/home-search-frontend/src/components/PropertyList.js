import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import './PropertyList.css';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12); // Limit of 12 properties per page

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/properties', {
          params: {
            page,
            limit,
          },
        });
        const propertiesData = response.data.properties || [];
        const totalProperties = response.data.total || 0;

        setProperties(propertiesData);
        setFilteredProperties(propertiesData);
        setTotalPages(Math.ceil(totalProperties / limit));
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    };
    fetchProperties();
  }, [page, limit]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter((property) =>
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  if (error) {
    return <div className="error">Error loading properties: {error.message}</div>;
  }

  return (
    <div className="property-list">
      <h1 className="title">Find Your Dream Home</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="property-grid">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property, index) => (
            <div key={index} className="property-card">
              <h2 className="property-title">{property.address}</h2>
              <p>Price: {property.price}</p>
              <p>Bedrooms: {property.bedrooms}</p>
              <p>Bathrooms: {property.bathrooms}</p>
              <p>Area: {property.area}</p>
              <p>Property Type: {property.property_type}</p>
              <a href={property.link} target="_blank" rel="noopener noreferrer" className="view-property-link">
                View Property
              </a>
            </div>
          ))
        ) : (
          <div className="no-properties">No properties found.</div>
        )}
      </div>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={page === 1} className="pagination-button">
          Previous
        </button>
        <span className="page-info"> Page {page} of {totalPages} </span>
        <button onClick={handleNextPage} disabled={page >= totalPages} className="pagination-button">
          Next
        </button>
      </div>
    </div>
  );
}

export default PropertyList;
