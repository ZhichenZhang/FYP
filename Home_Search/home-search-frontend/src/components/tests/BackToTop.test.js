import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackToTop from '../BackToTop';

describe('BackToTop Component', () => {
  // Mock window.scrollTo
  beforeAll(() => {
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true
    });
  });

  afterEach(() => {
    window.scrollTo.mockClear();
  });

  test('does not render when pageYOffset is less than 300', () => {
    // Set pageYOffset to 0
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    
    render(<BackToTop />);
    
    // Button should not be in the document
    expect(screen.queryByText('↑ Top')).not.toBeInTheDocument();
  });

  test('renders when pageYOffset is more than 300', () => {
    // Set pageYOffset to 400
    Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true });
    
    render(<BackToTop />);
    
    // Trigger the effect
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    
    // Button should be in the document
    expect(screen.getByText('↑ Top')).toBeInTheDocument();
  });

  test('scrolls to top when clicked', () => {
    // Set pageYOffset to 400
    Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true });
    
    render(<BackToTop />);
    
    // Trigger the effect
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    
    // Find and click the button
    const button = screen.getByText('↑ Top');
    fireEvent.click(button);
    
    // Check if window.scrollTo was called with the correct params
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  test('adds and removes event listener', () => {
    // Mock addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    // Set pageYOffset to 400
    Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true });
    
    const { unmount } = render(<BackToTop />);
    
    // Check if addEventListener was called with 'scroll'
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    // Unmount the component
    unmount();
    
    // Check if removeEventListener was called with 'scroll'
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});