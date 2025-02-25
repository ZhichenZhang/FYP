import React, { useState, useRef, useEffect } from 'react';
import deepseekService from '../services/deepseekService';
import './ChatBot.css';

function ChatBot({ properties, onPropertySelected }) {
  const [messages, setMessages] = useState([
    { 
      text: "Hi there! I'm your property assistant. How can I help you find your dream home today?", 
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Format properties data for the AI context
  const formatPropertiesForContext = () => {
    return properties.slice(0, 20).map(p => ({
      id: p.id,
      address: p.address,
      price: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      property_type: p.property_type
    }));
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const propertyContext = formatPropertiesForContext();
      
      // Format chat history for the DeepSeek API
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));
      
      // Use the DeepSeek service to get a response
      const botReply = await deepseekService.searchProperties(
        input,
        propertyContext,
        chatHistory
      );
      
      // Check if we need to show a specific property
      const showPropertyMatch = botReply.match(/SHOW_PROPERTY:([a-zA-Z0-9-_]+)/);
      if (showPropertyMatch) {
        const propertyId = showPropertyMatch[1];
        const cleanedReply = botReply.replace(/SHOW_PROPERTY:[a-zA-Z0-9-_]+/, '');
        
        // Trigger property selection in parent component
        const foundProperty = properties.find(p => p.id === propertyId);
        if (foundProperty && onPropertySelected) {
          onPropertySelected(foundProperty);
        }
        
        setMessages(prev => [...prev, { text: cleanedReply, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error getting DeepSeek API response:', error);
      setMessages(prev => [
        ...prev, 
        { 
          text: "Sorry, I encountered an error while processing your request. Please try again.", 
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
  
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span>Property Assistant</span>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">{message.text}</div>
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about properties..."
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