// deepseekService.js
import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:5000'
  : 'https://backend-withered-field-7034.fly.dev';


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
          temperature: 0.8,
          max_tokens: 400,
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
You're a property search assistant that corrects spelling mistakes and returns clean search queries.

User query: "${userText}"

First, identify and correct any spelling mistakes in the user's query.
Common corrections include:
- "hose", "house" → "house"
- "dablin", "doblin", "doeblin" → "dublin"
- "geaden", "gardn" → "garden"
- "apartmnt" → "apartment"

If the query doesn't seem related to property search or contains complete gibberish, respond with exactly "INVALID_QUERY".

If you detect a misspelling, respond with EXACTLY this format:
"The user's query "${userText}" appears to be a misspelling of "[correction]." Refined query: [search terms]"

Otherwise, just return the cleaned search terms directly.

Remember:
1. For multiple locations, separate them with commas (e.g., "dublin, galway")
2. Include ONLY what the user explicitly mentioned
3. DO NOT add price ranges, bedroom counts, or other details unless explicitly mentioned by the user
4. Keep the search terms concise and clean
        `
      }
    ];
    const completion = await this.generateChatCompletion(messages);
    const response = completion.choices[0].message.content.trim();
    
    // Add explicit check for INVALID_QUERY
    if (response === "INVALID_QUERY") {
      throw new Error("Invalid property query");
    }
    
    return response;
  }
};

export default deepseekService;