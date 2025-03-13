// ChatBot.js
import React, { useState, useRef, useEffect } from 'react';
import deepseekService from '../services/deepseekService'; 
import './ChatBot.css';

// Define a comprehensive list of locations including counties and towns
const LOCATION_PATTERN = /\b(carlow|cavan|clare|cork|donegal|dublin|galway|kerry|kildare|kilkenny|laois|leitrim|limerick|longford|louth|mayo|meath|monaghan|offaly|roscommon|sligo|tipperary|waterford|westmeath|wexford|wicklow|antrim|armagh|down|fermanagh|londonderry|tyrone|swords|bray|navan|drogheda|dundalk|celbridge|athlone|tralee|killarney|naas|newbridge|portlaoise|mullingar|letterkenny|tullamore|malahide|maynooth|greystones|skerries|ashbourne|carrigaline|cobh|midleton|mallow|youghal|clonmel|nenagh|thurles|kilkenny|portlaoise|castlebar|ballina|ennis|shannon|kilrush|dungarvan|clondalkin|tallaght|lucan|blanchardstown|finglas|howth|dun laoghaire|blackrock|dalkey|ranelagh|rathmines|drumcondra|santry|ballymun|balbriggan|rush|lusk|kinsealy)\b/gi;

function ChatBot({ 
  properties, 
  onPropertySelected, 
  onFilterProperties 
}) {
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your property assistant. How can I help you find your dream home today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    try {
      // Let DeepSeek handle all validation and correction
      const fullResponse = await deepseekService.parseUserQuery(input);
      
      // Extract just the search terms, ignoring explanatory text
      // Look for "Refined query:" or take the whole string if not found
      let refinedQuery = fullResponse;
      if (fullResponse.includes("Refined query:")) {
        refinedQuery = fullResponse.split("Refined query:")[1].trim();
      }
      
      // Check if there are multiple locations in the query using the enhanced pattern
      const locationMatches = refinedQuery.match(LOCATION_PATTERN);

      const uniqueLocations = locationMatches ? [...new Set(locationMatches.map(loc => loc.toLowerCase()))] : [];
      
      let responseMessage;
      if (uniqueLocations.length > 1) {
        // Multiple locations detected
        const locationList = uniqueLocations.join(' and ');
        responseMessage = `I'll look for properties in ${locationList} with: "${refinedQuery}"`;
      } else {
        // Single or no location
        responseMessage = `Sure! Let me filter properties using: "${refinedQuery}"`;
      }
  
      // Show user what we got from the LLM
      const botMsg = { text: responseMessage, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
  
      // Trigger the site filter with just the actual search terms
      onFilterProperties(refinedQuery);
  
    } catch (error) {
      console.error('ChatBot error:', error);
      const errMsg = { 
        text: "I'm not sure I understand. Please ask about properties using terms like 'location', 'price', 'house type', etc.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span>Property Assistant</span>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Ask about properties..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBot;