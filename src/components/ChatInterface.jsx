import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [currentStreamedText, setCurrentStreamedText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedText]);

  useEffect(() => {
    // Focus input field when component mounts
    inputRef.current?.focus();
    
    // Clean up any lingering timeouts when component unmounts
    return () => {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to extract answer text
  const extractAnswerText = (response) => {
    if (typeof response === 'string') {
      if (response.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(response);
          return parsed.answer || '';
        } catch (e) {
          return response;
        }
      }
      return response;
    }
    
    if (response && typeof response === 'object' && response.answer) {
      return response.answer;
    }
    
    if (response && typeof response === 'object' && response.response) {
      return response.response;
    }
    
    return typeof response === 'object' ? JSON.stringify(response) : String(response);
  };

  // Fixed streaming function to ensure the first letter appears
  const simulateStreaming = (text) => {
    // Clear any existing timeout to avoid conflicts
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }
    
    setStreaming(true);
    // Start with an empty string
    setCurrentStreamedText('');
    
    // Break the text into characters
    const textChunks = text.split('');
    let currentIndex = 0;
    
    // Explicit function to add chunks one by one
    const addNextChunk = () => {
      if (currentIndex < textChunks.length) {
        // Explicitly update with exact current index
        setCurrentStreamedText(textChunks.slice(0, currentIndex + 1).join(''));
        currentIndex++;
        
        // Store timeout reference for cleanup
        streamTimeoutRef.current = setTimeout(() => {
          addNextChunk();
        }, Math.floor(Math.random() * 15) + 10); // 10-25ms delay
      } else {
        // Finished streaming, add to messages
        finishStreaming(text);
      }
    };
    
    // Start immediately with the first character
    setCurrentStreamedText(textChunks[0]);
    currentIndex = 1;
    
    // Continue with the rest after a delay
    streamTimeoutRef.current = setTimeout(() => {
      addNextChunk();
    }, Math.floor(Math.random() * 15) + 10);
  };
  
  // Called when streaming is complete
  const finishStreaming = (completeText) => {
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: completeText
    }]);
    setStreaming(false);
    setCurrentStreamedText('');
    setLoading(false);
  };

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
      
      // Extract only the answer text
      const answerText = extractAnswerText(apiResponse);
      console.log("Extracted answer text:", answerText);
      
      // Stream the response
      simulateStreaming(answerText);
    } catch (error) {
      console.error("Chat API error:", error);
      
      const errorMessage = { 
        type: 'error', 
        content: error.response?.data?.message || 
                 error.message || 
                 'Sorry, I encountered an error processing your request.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };  

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Egyptian History Assistant</h2>
        <p>Powered by RAG technology</p>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to the Egyptian History Assistant</h3>
            <p>Ask me anything about Egyptian history from the documents you've indexed!</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.type}-wrapper`}>
            {msg.type === 'user' && (
              <div className="avatar user-avatar">
                <span>You</span>
              </div>
            )}
            <div className={`message ${msg.type}`}>
              {msg.type === 'bot' && (
                <div className="bot-label">
                  <div className="bot-icon">🔍</div>
                  <div className="bot-name">History AI</div>
                </div>
              )}
              <div className="message-content">
                {msg.content}
              </div>
            </div>
            {msg.type === 'bot' && (
              <div className="avatar bot-avatar">
                <span>AI</span>
              </div>
            )}
          </div>
        ))}
        
        {streaming && (
          <div className="message-wrapper bot-wrapper">
            <div className="avatar bot-avatar">
              <span>AI</span>
            </div>
            <div className="message bot">
              <div className="bot-label">
                <div className="bot-icon">🔍</div>
                <div className="bot-name">History AI</div>
              </div>
              <div className="message-content">
                <div className="streaming-text">
                  {currentStreamedText}
                  <span className="cursor"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loading && !streaming && (
          <div className="message-wrapper bot-wrapper">
            <div className="avatar bot-avatar">
              <span>AI</span>
            </div>
            <div className="message bot">
              <div className="bot-label">
                <div className="bot-icon">🔍</div>
                <div className="bot-name">History AI</div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Egyptian history..."
            disabled={loading || streaming}
          />
          <button 
            className="send-button"
            onClick={handleSend} 
            disabled={loading || streaming || !input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="input-footer">
          <span className="input-hint">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;