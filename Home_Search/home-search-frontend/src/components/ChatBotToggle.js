import React from 'react';
import './ChatBotToggle.css';


function ChatBotToggle({ isOpen, toggleChat, unreadMessages = 0 }) {
  return (
    <div className={`chatbot-toggle ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
      {isOpen ? (
        <X size={24} />
      ) : (
        <>
          <MessageSquare size={24} />
          {unreadMessages > 0 && (
            <div className="notification-badge">{unreadMessages}</div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatBotToggle;