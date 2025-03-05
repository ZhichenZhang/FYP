import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import deepseekService from '../services/deepseekService';
import './ChatBot.css';

function ChatBot({ 
  properties, 
  onPropertySelected, 
  onFilterProperties 
}) {
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // 1. Add user's message to the conversation
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setInput('');

    try {
      // 2. Ask the LLM to parse the user’s input into a short search term.
      const refinedQuery = await deepseekService.parseUserQuery(input);

      // 3. Filter the page using that refined query (this triggers a request in PropertyList)
      onFilterProperties(refinedQuery);


      const refineMessage = {
        text: `Sure! Let me filter properties using: "${refinedQuery}".`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, refineMessage]);

    } catch (error) {
      console.error('Error parsing user query:', error);
      setMessages(prev => [
        ...prev, 
        { 
          text: "Sorry, there was an error processing your request. Please try again.", 
          sender: 'bot' 
        }
      ]);
    } finally {
      setIsLoading(false);
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
