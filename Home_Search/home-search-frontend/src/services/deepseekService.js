import axios from 'axios';

// DeepSeek API service
const deepseekService = {
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY,
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions', // Update with actual endpoint
  
  // Method to generate a chat completion
  async generateChatCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: options.model || "deepseek-chat", // Default model
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  },
  
  // Method specifically for property search
  async searchProperties(userQuery, propertyData, chatHistory = []) {
    const messages = [
      {
        role: "system",
        content: `You are a helpful property search assistant. You help users find properties based on their needs. 
        Here's the current property database:
        ${JSON.stringify(propertyData)}
        
        If the user asks about specific properties (e.g., by location, price range, number of bedrooms), 
        find matching properties from the database. If multiple properties match, list the top 3.
        Format your responses with the property ID, address, price, and key features.
        If a user wants to see a specific property, respond with "SHOW_PROPERTY:[property_id]" at the end of your message.`
      },
      ...chatHistory,
      { role: "user", content: userQuery }
    ];
    
    try {
      const completion = await this.generateChatCompletion(messages);
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
};

export default deepseekService;