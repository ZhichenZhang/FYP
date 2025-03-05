import React from 'react';
import { Map, ExternalLink, Home, Calendar } from 'lucide-react';
import './PropertyCard.css';

function PropertyCard({ property, isFavorite, onFavoriteToggle }) {
  if (!property || !property.address) return null;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle();
  };

  const timeOnMarket = property.date_entered || 'N/A';
  const berRating = property.ber_rating || 'N/A';

  // Parse numeric price & area if needed
  const numericPrice = parseInt((property.price || '').replace(/[^\d]/g, ''), 10) || 0;
  const numericArea = parseInt((property.area || '').replace(/[^\d]/g, ''), 10) || 0;

  return (
    <div id={`property-${property.id}`} className="property-card">
      <button
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill={isFavorite ? '#000' : 'none'}
          stroke={isFavorite ? 'none' : 'currentColor'}
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5
                   2.09C13.09 3.81 14.76 3 16.5 3c3.08 0
                   5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55
                   11.54L12 21.35z"
          />
        </svg>
      </button>
      
      <div className="property-header">
        <div className="property-type-badge">
          <Home size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {property.property_type}
        </div>
        <div className="property-meta">
          <span className="ber-rating">{berRating}</span>
          <span>
            <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {timeOnMarket} on market
          </span>
        </div>
      </div>

      <h2 className="property-title">{property.address}</h2>
      
      <div className="property-details">
        {}
        <p className="property-price">{property.price || 'N/A'}</p>

        <div className="property-specs-grid">
          <div className="property-spec">
            <span className="spec-label">Bedrooms</span>
            <span className="spec-value">{property.bedrooms}</span>
          </div>
          <div className="property-spec">
            <span className="spec-label">Bathrooms</span>
            <span className="spec-value">{property.bathrooms}</span>
          </div>
          <div className="property-spec">
            <span className="spec-label">Floor Area</span>
            <span className="spec-value">{property.area}</span>
          </div>
          <div className="property-spec">
            <span className="spec-label">Price per m²</span>
            <span className="spec-value">
              {numericPrice && numericArea
                ? `€${Math.round(numericPrice / numericArea).toLocaleString()}`
                : 'N/A'
              }
            </span>
          </div>
        </div>
        
        <div className="property-links">
          {property.link && (
            <a
              href={property.link}
              target="_blank"
              rel="noopener noreferrer"
              className="property-link"
            >
              <ExternalLink size={16} />
              View on Daft.ie
            </a>
          )}
          
          {property.map_link && (
            <a
              href={property.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="property-link"
            >
              <Map size={16} />
              View on Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
