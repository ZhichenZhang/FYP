import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property, isFavorite, onFavoriteToggle }) => {
  return (
    <div className="property-card">
      <h2>{property.address}</h2>
      <p><strong>Price:</strong> {property.price}</p>
      <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
      <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
      <p><strong>Area:</strong> {property.area}</p>
      <p><strong>Type:</strong> {property.property_type}</p>
      <a href={property.link} target="_blank" rel="noopener noreferrer" className="view-property-link">
        View Property
      </a>
      <button
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={onFavoriteToggle}
      >
        {isFavorite ? '❤️' : '♡'}
      </button>
    </div>
  );
};

export default PropertyCard;
