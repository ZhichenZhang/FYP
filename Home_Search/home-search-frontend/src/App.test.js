// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  
  return {
    ...originalModule,
    BrowserRouter: ({ children }) => children,
    Routes: ({ children }) => children,
    Route: ({ children }) => children,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useRoutes: jest.fn(),
    useNavigate: () => jest.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: '5nvxpbdafa',
    }),
    useParams: () => ({}),
  };
});

// Mock axios with more detailed response
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ 
    data: { 
      properties: [
        {
          id: 'test-1',
          address: 'Test Property',
          price: '€300,000',
          bedrooms: '3',
          bathrooms: '2',
          property_type: 'House'
        }
      ], 
      total: 1 
    } 
  }))
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // This imports the toBeInTheDocument matcher
import App from './App';

test('renders app without crashing', async () => {
  render(<App />);
  
  // Look for the app title which should be rendered regardless of routes
  expect(screen.getByText('Home Search')).toBeInTheDocument();
});