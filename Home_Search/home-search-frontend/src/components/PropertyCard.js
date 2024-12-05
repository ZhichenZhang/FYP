import React from 'react';

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">
      <h2>{property.address}</h2>
      <p><strong>Price:</strong> {property.price}</p>
      <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
      <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
      <p><strong>Area:</strong> {property.area}</p>
      <p><strong>Type:</strong> {property.property_type}</p>
      <a href={property.link} target="_blank" rel="noopener noreferrer">View Property</a>
    </div>
  );
};

export default PropertyCard;
