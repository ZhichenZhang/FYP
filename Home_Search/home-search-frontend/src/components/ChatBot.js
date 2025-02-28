import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import deepseekService from '../services/deepseekService';
import './ChatBot.css';



function ChatBot({ properties, onPropertySelected, onPropertiesFiltered, user }) {
  const [messages, setMessages] = useState([
    {
      text: "Hi there! I'm your property assistant. How can I help you find your dream home today?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Show me houses with 3+ bedrooms",
    "Properties under €400,000",
    "Apartments in Dublin city center",
    "Houses with gardens"
  ]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    // Add the user's message to the chat history
    const userMessage = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

     
try {
  // Send the full user query to the backend
  const response = await axios.get('http://127.0.0.1:5000/api/filterProperties', {
    params: { query: text }
  });
  
  // Check if we got properties back
  if (response.data.properties && response.data.properties.length > 0) {
    const filteredProps = response.data.properties;
    
    // Call the parent component's handler to update the main property list
    if (onPropertiesFiltered && typeof onPropertiesFiltered === 'function') {
      onPropertiesFiltered(filteredProps);
    }
    
    setMessages(prev => [
      ...prev,
      { 
        text: `I found ${filteredProps.length} properties matching your criteria. I've updated the main property listing for you to browse.`, 
        sender: 'bot' 
      }
    ]);
  } else {
    setMessages(prev => [
      ...prev,
      { 
        text: "I couldn't find any properties matching those criteria. Could you try with different filters?", 
        sender: 'bot' 
      }
    ]);
  }
} catch (error) {
  console.error('Error processing query:', error);
  // Error handling code...
}
    
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  return (
    <div className={`chatbot-container ${minimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-title">
          <Bot size={18} />
          <span>Property Assistant</span>
        </div>
        <div className="chatbot-header-actions">
          {minimized ? (
            <Maximize2 size={18} onClick={toggleMinimize} className="chatbot-action-button" />
          ) : (
            <Minimize2 size={18} onClick={toggleMinimize} className="chatbot-action-button" />
          )}
          <X size={18} onClick={toggleMinimize} className="chatbot-action-button" />
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-avatar">
              {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && messages.length < 3 && (
        <div className="chatbot-suggestions">
          {suggestions.map((suggestion, index) => (
            <button key={index} className="suggestion-button" onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about properties..."
          disabled={isLoading}
        />
        <button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()} className="send-button">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatBot;