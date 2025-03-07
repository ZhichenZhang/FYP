// src/services/__tests__/deepseekService.test.js
import axios from 'axios';
import deepseekService from '../../services/deepseekService';

// Mock axios
jest.mock('axios');

describe('deepseekService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateChatCompletion', () => {
    test('calls axios with correct parameters', async () => {
      // Set up the mock response
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'This is a test response'
              }
            }
          ]
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      // Call the function with test parameters
      const messages = [{ role: 'user', content: 'Hello' }];
      const options = { temperature: 0.7 };
      const result = await deepseekService.generateChatCompletion(messages, options);

      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        deepseekService.apiEndpoint,
        {
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${deepseekService.apiKey}`
          }
        }
      );

      // Verify the response is returned correctly
      expect(result).toEqual(mockResponse.data);
    });

    test('handles API errors', async () => {
      // Set up the error response
      const errorMessage = 'Network error';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      // Call the function
      try {
        await deepseekService.generateChatCompletion([]);
        // If it doesn't throw, fail the test
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the error was caught and logged
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('parseUserQuery', () => {
    test('parses user query correctly', async () => {
      // Set up the mock response
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: '3 bed house dublin under 400k'
              }
            }
          ]
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      // Call the function
      const userText = 'I want a 3 bedroom house in Dublin for under 400,000 euros';
      const result = await deepseekService.parseUserQuery(userText);

      // Verify the result
      expect(result).toBe('3 bed house dublin under 400k');

      // Verify axios was called with the correct system message
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining(userText)
            })
          ])
        }),
        expect.any(Object)
      );
    });
  });
});