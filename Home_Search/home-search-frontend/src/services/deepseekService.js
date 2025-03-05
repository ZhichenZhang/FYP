import axios from 'axios';

const deepseekService = {
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY,
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  
  async generateChatCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: options.model || "deepseek-chat",
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
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // New function: Let the LLM parse the user’s text into a search query
  // ─────────────────────────────────────────────────────────────────────────────
  async parseUserQuery(userText) {
    const messages = [
      {
        role: "system",
        content: `
You are a property-search assistant. 
Your job is to convert the user’s text into a short query string for searching the property database. 
Do not include extra explanations. 
Output just the refined query text that captures price ranges, property types, and features. 
Example: 
User: "I'm looking for a house with garden under 400k" 
You output: "house garden under 400k".
`
      },
      {
        role: "user",
        content: userText
      }
    ];

    try {
      const completion = await this.generateChatCompletion(messages, {
        temperature: 0.4,   // Keep it fairly low so it doesn't hallucinate
        maxTokens: 100      // We only need a short string
      });
      // Extract the text from the LLM’s first choice
      const refinedSearchText = completion.choices[0].message.content.trim();
      return refinedSearchText;
    } catch (error) {
      console.error('Error parsing user query via DeepSeek:', error);
      throw error;
    }
  },
  
  // This was your existing method that tries to do everything in the LLM,
  // but we’ll leave it here in case you still want it for other uses.
  async searchProperties(userQuery, propertyData, chatHistory = []) {
    const queryRules = `
    Property Search Guidelines:
    1. Understand complex, multi-criteria search queries
    2. Extract key search parameters:
       - Price range (e.g., "under 400k", "between 300k and 500k")
       - Property type (house, apartment, detached)
       - Bedrooms/bathrooms count
       - Specific features (garden, parking, etc.)
    3. Translate natural language to specific search criteria
    4. If multiple criteria exist, find properties matching most conditions
    5. Prioritize exact matches, then partial matches
    `;

    const messages = [
      {
        role: "system",
        content: `You are an advanced property search assistant. 
        ${queryRules}
        Property Database: ${JSON.stringify(propertyData)}
        Response Format:
        - Provide top 3 matching properties
        - Include property ID, address, price, key features
        - If no exact match, provide closest recommendations
        - Use "SHOW_PROPERTY:[property_id]" for specific property details`
      },
      ...chatHistory,
      { 
        role: "user", 
        content: `Advanced Search Query: ${userQuery}. 
        Analyze the query comprehensively and find the best property matches.`
      }
    ];
    
    try {
      const completion = await this.generateChatCompletion(messages, {
        temperature: 0.6,
        maxTokens: 1500
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
};

export default deepseekService;
