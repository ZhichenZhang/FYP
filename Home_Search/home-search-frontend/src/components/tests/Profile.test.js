import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Profile';

describe('Profile Component', () => {
  test('renders profile information correctly', () => {
    render(<Profile />);
    
    // Check for profile title
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    
    // Check for profile details
    expect(screen.getByText(/Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Student ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    
    // Check for specific profile data
    expect(screen.getByText(/Zhichen Zhang/)).toBeInTheDocument();
    expect(screen.getByText(/21356001/)).toBeInTheDocument();
    expect(screen.getByText(/Zhi.zhang.2022@mumail.ie/)).toBeInTheDocument();
  });
});