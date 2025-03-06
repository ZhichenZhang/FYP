// deepseekService.js
import axios from 'axios';

const deepseekService = {
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY,
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',

  async generateChatCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: "deepseek-chat",
          messages,
          temperature: 0.5,
          max_tokens: 200,
          ...options,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  },

  // A parseUserQuery that returns a short, refined string
  async parseUserQuery(userText) {
    const messages = [
      {
        role: "system",
        content: `
You're a property search assistant. 
User: ${userText}

Return a concise query capturing the property search. Follow these guidelines:
1. For multiple locations, separate them with commas (e.g., "dublin, galway")
2. Include both cities and regions mentioned
3. Format should be like "house under 300k 3 bed dublin, athlone"
4. If a location is mentioned in relation to another (e.g., "near", "close to"), include both
5. No extra text, just the refined query.
        `
      }
    ];
    const completion = await this.generateChatCompletion(messages);
    return completion.choices[0].message.content.trim();
  }
};

export default deepseekService;