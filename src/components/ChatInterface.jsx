// import React, { useState, useEffect, useRef } from 'react';
// import api from '../services/api';
// import './ChatInterface.css';

// const ChatInterface = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [streaming, setStreaming] = useState(false);
//   const [currentStreamedText, setCurrentStreamedText] = useState('');
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const streamTimeoutRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, currentStreamedText]);

//   useEffect(() => {
//     // Focus input field when component mounts
//     inputRef.current?.focus();

//     // Clean up any lingering timeouts when component unmounts
//     return () => {
//       if (streamTimeoutRef.current) {
//         clearTimeout(streamTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Helper function to extract answer text
//   const extractAnswerText = (response) => {
//     if (typeof response === 'string') {
//       if (response.trim().startsWith('{')) {
//         try {
//           const parsed = JSON.parse(response);
//           return parsed.answer || '';
//         } catch (e) {
//           return response;
//         }
//       }
//       return response;
//     }

//     if (response && typeof response === 'object' && response.answer) {
//       return response.answer;
//     }

//     if (response && typeof response === 'object' && response.response) {
//       return response.response;
//     }

//     return typeof response === 'object' ? JSON.stringify(response) : String(response);
//   };

//   // Fixed streaming function to ensure the first letter appears
//   const simulateStreaming = (text) => {
//     // Clear any existing timeout to avoid conflicts
//     if (streamTimeoutRef.current) {
//       clearTimeout(streamTimeoutRef.current);
//     }

//     setStreaming(true);
//     // Start with an empty string
//     setCurrentStreamedText('');

//     // Break the text into characters
//     const textChunks = text.split('');
//     let currentIndex = 0;

//     // Explicit function to add chunks one by one
//     const addNextChunk = () => {
//       if (currentIndex < textChunks.length) {
//         // Explicitly update with exact current index
//         setCurrentStreamedText(textChunks.slice(0, currentIndex + 1).join(''));
//         currentIndex++;

//         // Store timeout reference for cleanup
//         streamTimeoutRef.current = setTimeout(() => {
//           addNextChunk();
//         }, Math.floor(Math.random() * 15) + 10); // 10-25ms delay
//       } else {
//         // Finished streaming, add to messages
//         finishStreaming(text);
//       }
//     };

//     // Start immediately with the first character
//     setCurrentStreamedText(textChunks[0]);
//     currentIndex = 1;

//     // Continue with the rest after a delay
//     streamTimeoutRef.current = setTimeout(() => {
//       addNextChunk();
//     }, Math.floor(Math.random() * 15) + 10);
//   };

//   // Called when streaming is complete
//   const finishStreaming = (completeText) => {
//     setMessages(prev => [...prev, {
//       type: 'bot',
//       content: completeText
//     }]);
//     setStreaming(false);
//     setCurrentStreamedText('');
//     setLoading(false);
//   };

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMessage = { type: 'user', content: input };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setLoading(true);

//     try {
//       console.log("Sending question to API:", input.trim());

//       const apiResponse = await api.askQuestion(input.trim());
//       console.log("Raw API response:", apiResponse);

//       // Extract only the answer text
//       const answerText = extractAnswerText(apiResponse);
//       console.log("Extracted answer text:", answerText);

//       // Stream the response
//       simulateStreaming(answerText);
//       inputRef.current.value='';
//       inputRef.current.focus();
//     } catch (error) {
//       console.error("Chat API error:", error);

//       const errorMessage = {
//         type: 'error',
//         content: error.response?.data?.message ||
//                  error.message ||
//                  'Sorry, I encountered an error processing your request.'
//       };

//       setMessages(prev => [...prev, errorMessage]);
//       setLoading(false);
//     }

//   };

//   return (
//     <div className="chat-container " style={{ height: '100%',overflowY: 'auto' }}>
//       <div className="chat-header">
//         <h2>Egyptian History Assistant</h2>
//         <p>Powered by RAG technology</p>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 && (
//           <div className="welcome-message">
//             <h3>Welcome to the Egyptian History Assistant</h3>
//             <p>Ask me anything about Egyptian history from the documents you've indexed!</p>
//           </div>
//         )}

//         {messages.map((msg, index) => (
//           <div key={index} className={`message-wrapper ${msg.type}-wrapper `}>
//             {msg.type === 'user' && (
//               <div className="avatar user-avatar text-bg-secondary">
//                 <span>You</span>
//               </div>
//             )}
//             <div className={`message ${msg.type}`}>
//               {msg.type === 'bot' && (
//                 <div className="bot-label">
//                   <div className="bot-icon">🔍</div>
//                   <div className="bot-name">History AI</div>
//                 </div>
//               )}
//               <div className="message-content =">
//                 {msg.content}
//               </div>
//             </div>
//             {msg.type === 'bot' && (
//               <div className="avatar bot-avatar">
//                 <span>AI</span>
//               </div>
//             )}
//           </div>
//         ))}

//         {streaming && (
//           <div className="message-wrapper bot-wrapper">
//             <div className="avatar bot-avatar">
//               <span>AI</span>
//             </div>
//             <div className="message bot">
//               <div className="bot-label">
//                 <div className="bot-icon">🔍</div>
//                 <div className="bot-name">History AI</div>
//               </div>
//               <div className="message-content">
//                 <div className="streaming-text">
//                   {currentStreamedText}
//                   <span className="cursor"></span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading && !streaming && (
//           <div className="message-wrapper bot-wrapper">
//             <div className="avatar bot-avatar">
//               <span>AI</span>
//             </div>
//             <div className="message bot">
//               <div className="bot-label">
//                 <div className="bot-icon">🔍</div>
//                 <div className="bot-name">History AI</div>
//               </div>
//               <div className="message-content">
//                 <div className="typing-indicator">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="chat-input-container container-sm">
//         <div className="chat-input-wrapper">
//           <input
//             ref={inputRef}
//             type="text"
//             id='chat-input'
//             autoFocus
//             className="chat-input"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//             placeholder="Ask about Egyptian history..."
//             disabled={loading || streaming}
//           />
//           <button
//             className="send-button"
//             onClick={handleSend}
//             disabled={loading || streaming || !input.trim()}
//             aria-label="Send message"
//           >
//             <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="22" y1="2" x2="11" y2="13"></line>
//               <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
//             </svg>
//           </button>

//         </div>
//         <div className="input-footer">
//           <span className="input-hint">Press Enter to send</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

import React, { useState, useEffect, useRef } from "react";
import "./ChatInterface.css";
import pyramids from "../Assets/Images/Pyramids.png";
import sabilKuttab from "../Assets/Images/sabil-kuttab.jpg";
import romanAmphitheater from "../Assets/Images/roman-amphitheater.jpg";
import catacombsKomElShoqafa from "../Assets/Images/catacombsKomElShoqafa.jpg";
import pompeysPillar from "../Assets/Images/pompeysPillar.jpg";
import blackPyramid from "../Assets/Images/blackPyramid.jpg";
import greatPyramid from "../Assets/Images/greatPyramid.jpg";
import khafrePyramid from "../Assets/Images/khafrePyramid.jpg";
import menkaurePyramid from "../Assets/Images/menkaurePyramid.jpg";
import sphinxGiza from "../Assets/Images/sphinxGiza.jpg";
import karnakTemple from "../Assets/Images/karnakTemple.jpg";
import luxorTemple from "../Assets/Images/luxorTemple.jpg";
import valleyOfTheKings from "../Assets/Images/valleyOfTheKings.jpg";
import abuSimbelTemple from "../Assets/Images/abuSimbelTemple.jpg";
import philaeTemple from "../Assets/Images/philaeTemple.jpg";
import saqqaraStepPyramid from "../Assets/Images/saqqaraStepPyramid.jpg";

import icon from "../Assets/Images/pharaoh-icon.png"; // Assuming you have an icon image for the bot avatar

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "👋 Welcome! Ask me anything about Egyptian history.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // data with imgs to change the background depending on the context ely hys2l feh
  const data = [
    { keywords: ["pyramids", "giza", "egypt pyramids"], img: pyramids },
    { keywords: ["sabil kuttab", "abd elrahman katkhuda"], img: sabilKuttab },
    {
      keywords: [
        "greco",
        "roman",
        "Roman amphitheater",
        "kom el-dikka",
        "alexandria",
      ],
      img: romanAmphitheater,
    },
    {
      keywords: [
        "catacombs",
        "kom el-shoqafa",
        "alexandria",
        "rock-cut tombs",
        "2nd century",
        "burial site",
        "roman egypt",
      ],
      img: catacombsKomElShoqafa,
    },
    {
      keywords: [
        "pompey's pillar",
        "alexandria",
        "roman column",
        "diocletian",
        "ancient alexandria",
        "roman egypt",
        "pillar of pompey",
        "alexandria landmarks",
        "monument",
        "egyptian roman ruins",
        "greco-roman",
        "granite column",
        "serapeum",
        "ruins of serapeum",
        "3rd century",
      ],
      img: pompeysPillar,
    },

    {
      keywords: [
        "black pyramid",
        "king amenemhat iii",
        "dahshur",
        "middle kingdom",
        "mudbrick pyramid",
        "collapsed pyramid",
        "amenemhat pyramid",
      ],
      img: blackPyramid,
    },
    {
      keywords: [
        "great pyramid",
        "pyramid of khufu",
        "giza",
        "great pyramid of giza",
        "cheops",
        "old kingdom",
        "largest pyramid",
        "seven wonders",
        "pyramids",
      ],
      img: greatPyramid,
    },
    {
      keywords: [
        "pyramid of khafre",
        "khafre",
        "giza",
        "middle pyramid",
        "second pyramid",
        "chephren",
        "pyramids",
      ],
      img: khafrePyramid,
    },
    {
      keywords: [
        "pyramid of menkaure",
        "menkaure",
        "giza",
        "third pyramid",
        "smallest pyramid",
        "pyramids",
      ],
      img: menkaurePyramid,
    },
    {
      keywords: [
        "sphinx",
        "great sphinx",
        "sphinx of giza",
        "giza",
        "lion statue",
        "khafre sphinx",
        "ancient egypt",
        "guardian of pyramids",
      ],
      img: sphinxGiza,
    },
    {
      keywords: [
        "temple of karnak",
        "karnak",
        "thebes",
        "luxor",
        "amun-ra",
        "hypostyle hall",
        "ancient temple",
        "new kingdom",
        "egyptian temples",
      ],
      img: karnakTemple,
    },
    {
      keywords: [
        "luxor temple",
        "luxor",
        "temple of luxor",
        "thebes",
        "amun",
        "ancient egypt",
        "night temple",
        "obelisk",
        "new kingdom",
      ],
      img: luxorTemple,
    },
    {
      keywords: [
        "valley of the kings",
        "thebes",
        "luxor",
        "royal tombs",
        "pharaoh tombs",
        "tutankhamun",
        "new kingdom",
        "necropolis",
        "burial site",
      ],
      img: valleyOfTheKings,
    },
    {
      keywords: [
        "temple of abu simbel",
        "abu simbel",
        "ramses ii",
        "great temple",
        "nubia",
        "rock-cut temple",
        "aswan",
        "sun festival",
        "ancient egypt",
        "new kingdom",
      ],
      img: abuSimbelTemple,
    },
    {
      keywords: [
        "philae temple",
        "philae",
        "isis temple",
        "temple of isis",
        "aswan",
        "greco-roman egypt",
        "island temple",
        "ancient egyptian temple",
        "philae island",
      ],
      img: philaeTemple,
    },
    {
      keywords: [
        "saqqara",
        "step pyramid",
        "pyramid of djoser",
        "djoser",
        "saqqara step pyramid",
        "oldest pyramid",
        "old kingdom",
        "necropolis",
        "memphis",
      ],
      img: saqqaraStepPyramid,
    },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await response.json();

      const botMessage = {
        type: "bot",
        content: data?.answer || "⚠️ I couldn’t find an answer.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Network error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>🏺 Egyptian History Assistant</h2>
        <p>Powered by RAG Technology</p>
      </header>
      <img src={pyramids} alt="" className="imgCover" />

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-wrapper ${
              msg.type === "user" ? "user-wrapper" : "bot-wrapper"
            }`}
          >
            {msg.type !== "user" && (
              <div className="avatar bot-avatar">
                <img src={icon} alt="" />
              </div>
            )}
            {msg.type === "user" && (
              <div className="avatar user-avatar">You</div>
            )}

            <div className={`message ${msg.type}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-wrapper bot-wrapper">
            <div className="avatar bot-avatar">AI</div>
            <div className="message bot">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
        <div className="input-footer">
          <div className="input-hint">Press Enter to send</div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
