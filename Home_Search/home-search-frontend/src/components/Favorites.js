import React from 'react';
import PropertyCard from './PropertyCard';
import './PropertyList.css';  // Reuse the same styling

function Favorites({ properties, favorites, onFavoriteToggle }) {
  const favoriteProperties = properties.filter(property => favorites.has(property.id));

  return (
    <div className="property-list">
      <h1 className="title">My Favorite Properties</h1>
      {favoriteProperties.length === 0 ? (
        <p style={{ textAlign: 'center', margin: '2rem' }}>
          You haven't added any properties to your favorites yet.
        </p>
      ) : (
        <div className="property-grid">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={true}
              onFavoriteToggle={() => onFavoriteToggle(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;