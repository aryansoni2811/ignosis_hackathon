import React, { useState } from 'react';
import { MessageCircle, CheckCircle, Send } from 'lucide-react';
import './MessagesSection.css';

const MessagesSection = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'John Smith',
      company: 'Global Marketing Inc.',
      lastMessage: 'Can we discuss the project timeline?',
      timestamp: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      sender: 'Emily Chen',
      company: 'TechInnovate Solutions',
      lastMessage: 'Looks great! Just a few minor adjustments needed.',
      timestamp: 'Yesterday',
      unread: false
    },
    {
      id: 3,
      sender: 'Michael Rodriguez',
      company: 'Creative Marketing Agency',
      lastMessage: 'When can you start working on the brochure?',
      timestamp: '3 days ago',
      unread: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      console.log('Message sent:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="messages-container">
    <div className="messages-section">
      <div className="messages-list">
        <div className="section-header">
          <h2>
            <MessageCircle className="messages-icon" />
            Messages
          </h2>
        </div>
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message-item ${message.unread ? 'unread' : ''}`}
          >
            <div className="message-avatar">
              <img 
                src="/api/placeholder/50/50" 
                alt={message.sender} 
                className="avatar"
              />
              {message.unread && <span className="unread-indicator"></span>}
            </div>
            <div className="message-content">
              <div className="message-header">
                <h3>{message.sender}</h3>
                <span className="timestamp">{message.timestamp}</span>
              </div>
              <p>{message.lastMessage}</p>
              <span className="company">{message.company}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="new-message-section">
        <h3>Start a New Conversation</h3>
        <div className="message-input-container">
          <textarea 
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
          ></textarea>
          <button 
            className="send-message-btn"
            onClick={handleSendMessage}
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MessagesSection;