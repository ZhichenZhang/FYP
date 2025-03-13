import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyCard from '../PropertyCard';

// Mock property data
const mockProperty = {
  id: '123',
  address: '123 Main Street, Dublin',
  price: '€350,000',
  bedrooms: '3 Bed',
  bathrooms: '2 Bath',
  area: '110 m²',
  property_type: 'Semi-Detached',
  ber_rating: 'BER B2',
  date_entered: '01/01/2023',
  link: 'https://example.com/property',
  map_link: 'https://maps.example.com/property'
};

describe('PropertyCard Component', () => {
  test('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} isFavorite={false} onFavoriteToggle={() => {}} />);
    
    // Check that key property information is displayed
    expect(screen.getByText('123 Main Street, Dublin')).toBeInTheDocument();
    expect(screen.getByText('€350,000')).toBeInTheDocument();
    expect(screen.getByText('3 Bed')).toBeInTheDocument();
    expect(screen.getByText('Semi-Detached')).toBeInTheDocument();
  });

  test('favorite button toggles correctly', () => {
    const mockToggle = jest.fn();
    
    // Render with isFavorite=false
    const { rerender } = render(
      <PropertyCard 
        property={mockProperty} 
        isFavorite={false} 
        onFavoriteToggle={mockToggle} 
      />
    );
    
    // Find and click favorite button
    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);
    
    // Check if toggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
    
    // Rerender with isFavorite=true to check toggled state
    rerender(
      <PropertyCard 
        property={mockProperty} 
        isFavorite={true} 
        onFavoriteToggle={mockToggle} 
      />
    );
    
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
  });

  test('external links render correctly', () => {
    render(<PropertyCard property={mockProperty} isFavorite={false} onFavoriteToggle={() => {}} />);
    
    const daftLink = screen.getByText('View on Daft.ie');
    const mapLink = screen.getByText('View on Map');
    
    expect(daftLink).toHaveAttribute('href', 'https://example.com/property');
    expect(mapLink).toHaveAttribute('href', 'https://maps.example.com/property');
  });
});