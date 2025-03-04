import axios from 'axios';

const DEEPSEEK_API_URL = process.env.REACT_APP_DEEPSEEK_API_URL;
const API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY;

const deepseekService = {
  async parsePropertyQuery(userMessage) {
    try {
      const systemPrompt = `Analyze this property search query and extract parameters in JSON format:
      {
        "bedrooms": {"min": number, "exact": number, "max": number},
        "price": {"min": number, "max": number},
        "location": string,
        "property_type": string,
        "features": string[],
        "intent": "rent"|"buy"|"unknown"
      }
      Consider synonyms, ranges, and approximate values. Convert all prices to EUR numbers.`;

      const response = await axios.post(DEEPSEEK_API_URL, {
        model: 'deepseek-chat',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('DeepSeek parsing error:', error);
      return null;
    }
  }
};

export default deepseekService;