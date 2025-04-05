// src/pages/Chat.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';

const Chat = () => {
  return (
    <div className="chat-page">
      <header>
        <Link to="/" className="back-link">Back to Home</Link>
      </header>
      
      <main>
        <ChatInterface />
      </main>
    </div>
  );
};

export default Chat;
