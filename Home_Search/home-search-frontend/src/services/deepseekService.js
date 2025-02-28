import axios from 'axios';

const DEEPSEEK_API_URL = process.env.REACT_APP_DEEPSEEK_API_URL;
const API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY;

const deepseekService = {
  async searchProperties(userMessage) {
    try {
      const requestConfig = {
        url: DEEPSEEK_API_URL,
        method: 'post',
        data: {
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: userMessage } // Ensure messages is an array of objects
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      };

      console.log('Request Config:', requestConfig); // Debugging line

      const response = await axios(requestConfig);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unauthorized'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response received from the server. Please check your network connection.');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error('Failed to send request to DeepSeek API.');
      }
    }
  }
};

export default deepseekService;