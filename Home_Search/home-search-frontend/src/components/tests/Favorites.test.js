import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Favorites from '../Favorites';

// Mock the PropertyCard component
jest.mock('../PropertyCard', () => {
  return function MockPropertyCard({ property, isFavorite, onFavoriteToggle }) {
    return (
      <div data-testid={`property-card-${property.id}`}>
        <h2>{property.address}</h2>
        <button 
          onClick={onFavoriteToggle}
          data-testid={`favorite-toggle-${property.id}`}
        >
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </button>
      </div>
    );
  };
});

describe('Favorites Component', () => {
  // Sample properties data
  const mockProperties = [
    {
      id: '123',
      address: '123 Main Street, Dublin',
      price: '€350,000',
      bedrooms: '3 Bed',
      bathrooms: '2 Bath',
      property_type: 'Semi-Detached'
    },
    {
      id: '456',
      address: '456 High Street, Cork',
      price: '€275,000',
      bedrooms: '2 Bed',
      bathrooms: '1 Bath',
      property_type: 'Apartment'
    }
  ];

  test('renders empty state when no favorites', () => {
    render(
      <Favorites properties={mockProperties} favorites={new Set()} onFavoriteToggle={() => {}} />
    );
    
    // Check if the empty state message is displayed
    expect(screen.getByText(/You haven't added any properties to your favorites yet/)).toBeInTheDocument();
  });

  test('renders favorite properties correctly', () => {
    const favorites = new Set(['123']); // Only the first property is favorited
    
    render(
      <Favorites 
        properties={mockProperties} 
        favorites={favorites} 
        onFavoriteToggle={() => {}} 
      />
    );
    
    // Check if the favorited property is displayed
    expect(screen.getByText('123 Main Street, Dublin')).toBeInTheDocument();
    
    // The second property should not be displayed
    expect(screen.queryByText('456 High Street, Cork')).not.toBeInTheDocument();
  });

  test('calls onFavoriteToggle when favorite button is clicked', () => {
    const favorites = new Set(['123']);
    const mockToggle = jest.fn();
    
    render(
      <Favorites 
        properties={mockProperties} 
        favorites={favorites} 
        onFavoriteToggle={mockToggle} 
      />
    );
    
    // Click the favorite toggle button
    const toggleButton = screen.getByTestId('favorite-toggle-123');
    toggleButton.click();
    
    // Check if the toggle function was called with the correct id
    expect(mockToggle).toHaveBeenCalledWith('123');
  });
});