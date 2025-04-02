import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

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
      console.log("Received response:", apiResponse);
      
      // Extract the answer and sources directly from the response
      // This assumes your backend returns { answer: "...", sources: [...] }
      const answerText = apiResponse.answer || '';
      const sourcesArray = apiResponse.sources || [];
      
      const botMessage = { 
        type: 'bot', 
        content: answerText, 
        sources: sourcesArray 
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
              {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
            </div>
            {msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
              <div className="sources">
                <p>Sources:</p>
                <ul>
                  {msg.sources.map((source, idx) => (
                    <li key={idx}>
                      {source.page ? `Page ${source.page}: ${source.text}` : source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
