import React, { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages update
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
