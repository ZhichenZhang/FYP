import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  test('renders search input correctly', () => {
    const mockSetSearchTerm = jest.fn();
    render(<SearchBar searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    
    const searchInput = screen.getByPlaceholderText('Search properties...');
    expect(searchInput).toBeInTheDocument();
  });

  test('calls setSearchTerm when input changes', () => {
    const mockSetSearchTerm = jest.fn();
    render(<SearchBar searchTerm="" setSearchTerm={mockSetSearchTerm} />);
    
    const searchInput = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(searchInput, { target: { value: 'dublin' } });
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith('dublin');
  });

  test('displays current search term', () => {
    const mockSetSearchTerm = jest.fn();
    render(<SearchBar searchTerm="3 bed house" setSearchTerm={mockSetSearchTerm} />);
    
    const searchInput = screen.getByPlaceholderText('Search properties...');
    expect(searchInput).toHaveValue('3 bed house');
  });
});