import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyList from '../PropertyList';

// Mock axios directly instead of importing it
jest.mock('axios', () => ({
  get: jest.fn()
}));

// Now import the mocked axios
import axios from 'axios';

// Mock property data
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

describe('PropertyList Component', () => {
  beforeEach(() => {
    // Reset mock between tests
    axios.get.mockReset();
  });

  test('fetches and displays properties', async () => {
    // Mock successful response
    axios.get.mockResolvedValueOnce({
      data: {
        properties: mockProperties,
        total: 2
      }
    });

    render(<PropertyList favorites={new Set()} onFavoriteToggle={() => {}} />);
    
    // Check loading state
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByText('123 Main Street, Dublin')).toBeInTheDocument();
      expect(screen.getByText('456 High Street, Cork')).toBeInTheDocument();
    });
    
    // Check API was called with correct params
    expect(axios.get).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/api/properties',
      { params: { page: 1, limit: 12, searchTerm: '' } }
    );
  });

  test('handles search term changes', async () => {
    // First render with empty response
    axios.get.mockResolvedValueOnce({
      data: {
        properties: [],
        total: 0
      }
    });

    render(<PropertyList favorites={new Set()} onFavoriteToggle={() => {}} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    
    // Mock response for search
    axios.get.mockResolvedValueOnce({
      data: {
        properties: [mockProperties[0]],
        total: 1
      }
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(searchInput, { target: { value: 'dublin' } });
    
    // Verify API call
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://127.0.0.1:8080/api/properties',
        { params: { page: 1, limit: 12, searchTerm: 'dublin' } }
      );
    });
    
    // Check filtered result
    await waitFor(() => {
      expect(screen.getByText('123 Main Street, Dublin')).toBeInTheDocument();
      expect(screen.queryByText('456 High Street, Cork')).not.toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Mock error response
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<PropertyList favorites={new Set()} onFavoriteToggle={() => {}} />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error fetching properties/i)).toBeInTheDocument();
    });
  });
});