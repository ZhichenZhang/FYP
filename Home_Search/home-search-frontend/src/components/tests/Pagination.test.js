import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test('renders correct number of page buttons', () => {
    render(
      <Pagination 
        currentPage={3} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Should render 5 page buttons (1, 2, 3, 4, 5) based on the currentPage and logic
    const pageButtons = screen.getAllByRole('button').filter(
      button => !button.textContent.includes('←') && !button.textContent.includes('→')
    );
    
    expect(pageButtons.length).toBe(5);
    expect(pageButtons[0].textContent).toBe('1');
    expect(pageButtons[4].textContent).toBe('5');
  });

  test('highlights current page', () => {
    render(
      <Pagination 
        currentPage={3} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find the button for page 3
    const currentPageButton = screen.getByRole('button', { name: '3' });
    
    // Check if it has the 'active' class
    expect(currentPageButton).toHaveClass('active');
  });

  test('disables previous button on first page', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find the previous button
    const prevButton = screen.getByLabelText('Previous page');
    
    // Check if it's disabled
    expect(prevButton).toBeDisabled();
  });

  test('disables next button on last page', () => {
    render(
      <Pagination 
        currentPage={10} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find the next button
    const nextButton = screen.getByLabelText('Next page');
    
    // Check if it's disabled
    expect(nextButton).toBeDisabled();
  });

  test('calls onPageChange when previous button is clicked', () => {
    render(
      <Pagination 
        currentPage={5} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find and click the previous button
    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);
    
    // Check if onPageChange was called with page 4
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  test('calls onPageChange when next button is clicked', () => {
    render(
      <Pagination 
        currentPage={5} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find and click the next button
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    
    // Check if onPageChange was called with page 6
    expect(mockOnPageChange).toHaveBeenCalledWith(6);
  });

  test('calls onPageChange when a page button is clicked', () => {
    render(
      <Pagination 
        currentPage={3} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Find and click page 5
    const pageButton = screen.getByRole('button', { name: '5' });
    fireEvent.click(pageButton);
    
    // Check if onPageChange was called with page 5
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  test('handles case when currentPage is near totalPages', () => {
    render(
      <Pagination 
        currentPage={9} 
        totalPages={10} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Should render 5 page buttons (6, 7, 8, 9, 10)
    const pageButtons = screen.getAllByRole('button').filter(
      button => !button.textContent.includes('←') && !button.textContent.includes('→')
    );
    
    expect(pageButtons.length).toBe(5);
    expect(pageButtons[0].textContent).toBe('6');
    expect(pageButtons[4].textContent).toBe('10');
  });

  test('handles case when totalPages is less than maxVisiblePages', () => {
    render(
      <Pagination 
        currentPage={2} 
        totalPages={3} 
        onPageChange={mockOnPageChange}
      />
    );
    
    // Should render 3 page buttons (1, 2, 3)
    const pageButtons = screen.getAllByRole('button').filter(
      button => !button.textContent.includes('←') && !button.textContent.includes('→')
    );
    
    expect(pageButtons.length).toBe(3);
    expect(pageButtons[0].textContent).toBe('1');
    expect(pageButtons[2].textContent).toBe('3');
  });
});