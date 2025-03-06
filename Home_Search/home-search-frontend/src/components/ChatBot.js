// ChatBot.js
import React, { useState, useRef, useEffect } from 'react';
import deepseekService from '../services/deepseekService'; 
import './ChatBot.css';

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
      // Example: ask DeepSeek to parse the user’s text
      const refinedQuery = await deepseekService.parseUserQuery(input);

      // Show user what we got from the LLM
      const botMsg = { text: `Sure! Let me filter properties using: "${refinedQuery}"`, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);

      // Trigger the site filter
      onFilterProperties(refinedQuery);

    } catch (error) {
      console.error('ChatBot error:', error);
      const errMsg = { text: "Sorry, there was an error processing your request.", sender: 'bot' };
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
