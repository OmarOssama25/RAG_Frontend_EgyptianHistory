import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// Helper function to extract text from any response format
const extractAnswerText = (response) => {
  // If response is already a string
  if (typeof response === 'string') {
    // If it looks like JSON, try to parse it
    if (response.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(response);
        return parsed.answer || '';
      } catch (e) {
        // If parsing fails, return the original string
        return response;
      }
    }
    // Otherwise return the string as-is
    return response;
  }
  
  // If response is an object with answer property
  if (response && typeof response === 'object' && response.answer) {
    return response.answer;
  }
  
  // If response is an object with response property
  if (response && typeof response === 'object' && response.response) {
    return response.response;
  }
  
  // If we can't extract anything meaningful, convert to string
  return typeof response === 'object' ? JSON.stringify(response) : String(response);
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      console.log("Sending question to API:", input.trim());
      
      const apiResponse = await api.askQuestion(input.trim());
      console.log("Raw API response:", apiResponse);
      
      // Extract only the answer text using our helper function
      const answerText = extractAnswerText(apiResponse);
      console.log("Extracted answer text:", answerText);
      
      // Create a message with ONLY the text content
      const botMessage = { 
        type: 'bot', 
        content: answerText
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      
      const errorMessage = { 
        type: 'error', 
        content: error.response?.data?.message || 
                 error.message || 
                 'Sorry, I encountered an error processing your request.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };  

  // Helper function to safely render message content
  const renderMessageContent = (content) => {
    // If content is a string, display it directly
    if (typeof content === 'string') {
      return content;
    }
    
    // If content is an object with an answer property, display only the answer
    if (content && typeof content === 'object' && content.answer) {
      return content.answer;
    }
    
    // Convert any other value to string
    return JSON.stringify(content);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to the Egyptian History Assistant</h3>
            <p>Ask me anything about Egyptian history from the documents you've indexed!</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about Egyptian history..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;

