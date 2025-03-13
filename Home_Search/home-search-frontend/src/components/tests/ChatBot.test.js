import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from '../ChatBot';
import deepseekService from '../../services/deepseekService';

// Mock deepseekService
jest.mock('../../services/deepseekService', () => ({
  parseUserQuery: jest.fn()
}));

// Mock scrollIntoView before tests run
beforeEach(() => {
  // Mock the scrollIntoView function
  const originalRefCurrent = window.HTMLElement.prototype.scrollIntoView;
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  return () => {
    window.HTMLElement.prototype.scrollIntoView = originalRefCurrent;
  };
});

describe('ChatBot Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    deepseekService.parseUserQuery.mockReset();
  });

  test('renders initial message', () => {
    render(
      <ChatBot 
        properties={[]} 
        onPropertySelected={() => {}} 
        onFilterProperties={() => {}} 
      />
    );
    
    // Check for welcome message
    expect(screen.getByText(/I'm your property assistant/)).toBeInTheDocument();
  });

  test('sends user message and receives response', async () => {
    // Mock the AI response
    deepseekService.parseUserQuery.mockResolvedValueOnce('house 3 bed dublin');
    
    const mockFilterProperties = jest.fn();
    
    render(
      <ChatBot 
        properties={[]} 
        onPropertySelected={() => {}} 
        onFilterProperties={mockFilterProperties} 
      />
    );
    
    // Type a message
    const input = screen.getByPlaceholderText('Ask about properties...');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'I want a 3 bedroom house in Dublin' } });
    });
    
    // Send the message - we need to use act() here because it triggers state updates
    await act(async () => {
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    // Check user message appears
    expect(screen.getByText('I want a 3 bedroom house in Dublin')).toBeInTheDocument();
    
    // Check bot response after API call resolves - using the exact text that appears
    await waitFor(() => {
      expect(screen.getByText(/Sure! Let me filter properties using/)).toBeInTheDocument();
    });
    
    // Check deepseekService was called
    expect(deepseekService.parseUserQuery).toHaveBeenCalledWith(
      'I want a 3 bedroom house in Dublin'
    );
    
    // Check filter was applied
    expect(mockFilterProperties).toHaveBeenCalledWith('house 3 bed dublin');
  });

  test('handles enter key press', async () => {
    deepseekService.parseUserQuery.mockResolvedValueOnce('apartment cork');
    
    render(
      <ChatBot 
        properties={[]} 
        onPropertySelected={() => {}} 
        onFilterProperties={() => {}} 
      />
    );
    
    // Type and press Enter - wrap in act() because it updates state
    const input = screen.getByPlaceholderText('Ask about properties...');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Show me apartments in Cork' } });
    });
    
    await act(async () => {
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    });
    
    // Check user message appears
    expect(screen.getByText('Show me apartments in Cork')).toBeInTheDocument();
  });
});