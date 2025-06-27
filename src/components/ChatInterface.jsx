import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "./ChatInterface.css";

import icon from "../Assets/Images/pharaoh-icon.png";

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

/*
 * CONVERSATION FEATURES CONFIGURATION:
 * 
 * Conversation features are now ENABLED because your backend supports:
 * - POST /api/chat/conversations (create conversation)
 * - GET /api/chat/conversations (get user conversations)
 * - GET /api/chat/conversations/:id (get specific conversation)
 * - POST /api/chat/conversations/:id/messages (add message to conversation)
 * - PUT /api/chat/conversations/:id (update conversation)
 * - DELETE /api/chat/conversations/:id (delete conversation)
 * 
 * CHAT HISTORY CONFIGURATION:
 * Set this to false to completely disable chat history loading/saving
 * (useful when backend doesn't support chat history endpoints yet)
 */
const ENABLE_CHAT_HISTORY = true; // Set to false to disable chat history

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [currentStreamedText, setCurrentStreamedText] = useState("");
  const [conversationFeaturesAvailable, setConversationFeaturesAvailable] = useState(true);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamTimeoutRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(pyramids);
  const [fade, setFade] = useState(false);

  const inputData = [
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Track conversation mode changes
  useEffect(() => {
    console.log(`Conversation features ${conversationFeaturesAvailable ? 'enabled' : 'disabled'}`);
  }, [conversationFeaturesAvailable]);

  // Function to extract user ID from auth token
  const extractUserIdFromToken = (token) => {
    try {
      // If your token is a JWT, you can decode it to get user info
      // For now, we'll use a simple approach - you can modify this based on your auth system
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.userId || tokenData.id || tokenData.sub || "current-user";
    } catch (error) {
      console.log("Could not extract user ID from token, using default");
      return "current-user";
    }
  };

  // Load chat history and get user ID on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // Get user ID from auth token or localStorage
        const token = localStorage.getItem("authToken");
        if (token) {
          // Extract user ID from token
          const userId = extractUserIdFromToken(token);
          setUserId(userId);
          
          // Try to load existing conversations
          try {
            const conversations = await api.getConversations();
            if (conversations && Array.isArray(conversations) && conversations.length > 0) {
              // Get the most recent conversation
              const latestConversation = conversations[0];
              const conversationId = latestConversation._id;
              
              // Store the conversation ID for future use
              localStorage.setItem("conversationId", conversationId);
              
              // Load messages from the conversation
              const conversation = await api.getConversation(conversationId);
              if (conversation && conversation.messages && Array.isArray(conversation.messages)) {
                // Convert conversation messages to frontend format
                const formattedMessages = conversation.messages.map(msg => ({
                  type: msg.role === "user" ? "user" : "bot",
                  content: msg.content,
                  timestamp: msg.timestamp
                }));
                setMessages(formattedMessages);
                console.log("Conversation history loaded successfully");
              }
            } else {
              // Create a new conversation if none exist
              const newConversation = await api.createConversation({
                title: "Egyptian History Chat"
              });
              if (newConversation && newConversation._id) {
                localStorage.setItem("conversationId", newConversation._id);
                console.log("New conversation created");
              }
            }
          } catch (conversationError) {
            console.log("Conversation features not available, falling back to simple chat");
            setConversationFeaturesAvailable(false);
          }
        }
      } catch (error) {
        console.log("Could not initialize chat history");
      }
    };

    if (ENABLE_CHAT_HISTORY) {
      loadChatHistory();
    }
  }, []);

  // Function to save message to conversation
  const saveMessageToConversation = async (message) => {
    if (!conversationFeaturesAvailable) return;
    
    try {
      const conversationId = localStorage.getItem("conversationId");
      if (!conversationId) return;
      
      const messageData = {
        role: message.type === "user" ? "user" : "assistant",
        content: message.content
      };
      
      await api.addMessageToConversation(conversationId, messageData);
    } catch (error) {
      console.log("Could not save message to conversation");
      // Don't show error to user - chat should continue working
    }
  };

  // Helper function to extract answer text
  const extractAnswerText = (response) => {
    if (typeof response === "string") {
      if (response.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(response);
          return parsed.answer || "";
        } catch (e) {
          return response;
        }
      }
      return response;
    }

    if (response && typeof response === "object" && response.answer) {
      return response.answer;
    }

    if (response && typeof response === "object" && response.response) {
      return response.response;
    }

    return typeof response === "object"
      ? JSON.stringify(response)
      : String(response);
  };

  // Fixed streaming function to ensure the first letter appears
  const simulateStreaming = (text) => {
    // Clear any existing timeout to avoid conflicts
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }

    setStreaming(true);
    // Start with an empty string
    setCurrentStreamedText("");

    // Break the text into characters
    const textChunks = text.split("");
    let currentIndex = 0;

    // Explicit function to add chunks one by one
    const addNextChunk = () => {
      if (currentIndex < textChunks.length) {
        // Explicitly update with exact current index
        setCurrentStreamedText(textChunks.slice(0, currentIndex + 1).join(""));
        currentIndex++;

        // Store timeout reference for cleanup - much faster streaming
        streamTimeoutRef.current = setTimeout(() => {
          addNextChunk();
        }, Math.floor(Math.random() * 3) + 2); // 2-5ms delay (was 10-25ms)
      } else {
        // Finished streaming, add to messages
        finishStreaming(text);
      }
    };

    // Start immediately with the first character
    setCurrentStreamedText(textChunks[0]);
    currentIndex = 1;

    // Continue with the rest after a very short delay
    streamTimeoutRef.current = setTimeout(() => {
      addNextChunk();
    }, Math.floor(Math.random() * 3) + 2); // 2-5ms delay (was 10-25ms)
  };

  // Called when streaming is complete
  const finishStreaming = (completeText) => {
    const botMessage = {
      type: "bot",
      content: completeText,
    };
    
    setMessages((prev) => [...prev, botMessage]);
    
    // Save bot message to conversation
    saveMessageToConversation(botMessage);
    
    setStreaming(false);
    setCurrentStreamedText("");
    setLoading(false);

    // Generate and add follow-up suggestions
    const suggestions = generateFollowUpSuggestions(completeText);
    if (suggestions.length > 0) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "suggestions",
            content: "You might also want to ask:",
            suggestions: suggestions,
          },
        ]);
      }, 1000); // Add suggestions after a short delay
    }
  };

  // Helper function to detect vague questions and provide suggestions
  const detectVagueQuestion = (question) => {
    const vaguePatterns = [
      /^what (is|does) (it|this|that) (mean|represent|refer to)\??$/i,
      /^what (is|does) (it|this|that)\??$/i,
      /^what about (it|this|that)\??$/i,
      /^tell me more$/i,
      /^explain$/i,
      /^how$/i,
      /^why$/i
    ];
    
    return vaguePatterns.some(pattern => pattern.test(question.trim()));
  };

  // Helper function to generate follow-up suggestions based on the last response
  const generateFollowUpSuggestions = (lastResponse) => {
    const suggestions = [];
    
    // Extract key topics from the response
    const topics = {
      pyramids: [
        "How were the pyramids built?",
        "Who were the pharaohs buried in pyramids?",
        "What's inside the pyramids?",
        "How long did it take to build the Great Pyramid?",
        "What tools did they use to build pyramids?",
        "Why were pyramids built in that shape?",
        "How many pyramids are there in Egypt?",
        "What was the purpose of the pyramid complex?",
        "How did they transport the stones?",
        "What's the significance of pyramid alignment?"
      ],
      temples: [
        "What was the purpose of Egyptian temples?",
        "How were temples decorated?",
        "Who could enter temples?",
        "What ceremonies took place in temples?",
        "How were temples funded?",
        "What's the difference between mortuary and cult temples?",
        "How were temples oriented?",
        "What role did priests play in temples?",
        "How were temples maintained?",
        "What happened during temple festivals?"
      ],
      pharaohs: [
        "How did pharaohs rule Egypt?",
        "What was the role of pharaohs in religion?",
        "How were pharaohs chosen?",
        "What powers did pharaohs have?",
        "How did pharaohs communicate with the gods?",
        "What was the pharaoh's daily life like?",
        "How were pharaohs buried?",
        "What titles did pharaohs have?",
        "How did pharaohs maintain power?",
        "What happened when a pharaoh died?"
      ],
      gods: [
        "Who were the main Egyptian gods?",
        "How did Egyptians worship their gods?",
        "What were Egyptian religious beliefs?",
        "What was the role of animal gods?",
        "How were gods represented in art?",
        "What were the major religious festivals?",
        "How did gods influence daily life?",
        "What was the relationship between gods and pharaohs?",
        "How were gods worshipped in homes?",
        "What happened to Egyptian religion over time?"
      ],
      afterlife: [
        "What did Egyptians believe about the afterlife?",
        "How did they prepare for death?",
        "What was mummification?",
        "What was the Book of the Dead?",
        "How did they judge souls in the afterlife?",
        "What was the journey to the afterlife like?",
        "What did they bury with the dead?",
        "How did they protect tombs?",
        "What was the role of the heart in the afterlife?",
        "How did beliefs about the afterlife change?"
      ],
      alexandria: [
        "What was Alexandria like in ancient times?",
        "Who founded Alexandria?",
        "What was the Library of Alexandria?",
        "What happened to the Pharos Lighthouse?",
        "What was Cleopatra's role in Alexandria?",
        "How did Alexandria become a center of learning?",
        "What was the cultural mix in Alexandria?",
        "How did Alexandria influence the Mediterranean?",
        "What remains of ancient Alexandria today?",
        "What was the significance of Alexandria's location?"
      ],
      cairo: [
        "What was Cairo like in ancient times?",
        "How did Cairo develop over time?",
        "What are the oldest parts of Cairo?",
        "What was the role of Cairo in Islamic Egypt?",
        "How did Cairo become the capital?",
        "What architectural styles are found in Cairo?",
        "What was medieval Cairo like?",
        "How did Cairo influence trade routes?",
        "What are Cairo's most important monuments?",
        "How has Cairo changed over centuries?"
      ],
      sphinx: [
        "What is the Great Sphinx?",
        "Who built the Sphinx?",
        "What does the Sphinx represent?",
        "How old is the Sphinx?",
        "What was the Sphinx's original purpose?",
        "How was the Sphinx carved?",
        "What happened to the Sphinx's nose?",
        "What's the connection between the Sphinx and pyramids?",
        "How has the Sphinx been restored?",
        "What mysteries surround the Sphinx?"
      ],
      valley: [
        "What is the Valley of the Kings?",
        "Why was it chosen for royal burials?",
        "How many tombs are in the Valley?",
        "What was the most famous discovery there?",
        "How were the tombs decorated?",
        "What was the purpose of the valley?",
        "How did they protect the tombs?",
        "What happened to the valley over time?",
        "How were the tombs discovered?",
        "What treasures were found in the valley?"
      ],
      nile: [
        "What was the importance of the Nile?",
        "How did the Nile shape Egyptian civilization?",
        "What was the annual flooding like?",
        "How did Egyptians use the Nile for transport?",
        "What was the Nile's role in agriculture?",
        "How did the Nile influence religion?",
        "What was the Nile's role in trade?",
        "How did they navigate the Nile?",
        "What was the Nile's role in warfare?",
        "How has the Nile changed over time?"
      ],
      hieroglyphs: [
        "What are hieroglyphs?",
        "How were hieroglyphs deciphered?",
        "What was the Rosetta Stone?",
        "How many hieroglyphic symbols were there?",
        "Who could read and write hieroglyphs?",
        "How were hieroglyphs used?",
        "What other writing systems did Egyptians use?",
        "How did hieroglyphs evolve?",
        "What was the purpose of hieroglyphs?",
        "How do we translate hieroglyphs today?"
      ]
    };
    
    // Simple keyword matching to suggest relevant questions
    const responseLower = lastResponse.toLowerCase();
    
    // Check for multiple topics and collect all relevant suggestions
    const allSuggestions = [];
    
    if (responseLower.includes("pyramid")) {
      allSuggestions.push(...topics.pyramids);
    }
    if (responseLower.includes("temple")) {
      allSuggestions.push(...topics.temples);
    }
    if (responseLower.includes("pharaoh") || responseLower.includes("king")) {
      allSuggestions.push(...topics.pharaohs);
    }
    if (responseLower.includes("god") || responseLower.includes("religious")) {
      allSuggestions.push(...topics.gods);
    }
    if (responseLower.includes("afterlife") || responseLower.includes("death") || responseLower.includes("mummy")) {
      allSuggestions.push(...topics.afterlife);
    }
    if (responseLower.includes("alexandria")) {
      allSuggestions.push(...topics.alexandria);
    }
    if (responseLower.includes("cairo")) {
      allSuggestions.push(...topics.cairo);
    }
    if (responseLower.includes("sphinx")) {
      allSuggestions.push(...topics.sphinx);
    }
    if (responseLower.includes("valley") || responseLower.includes("tomb")) {
      allSuggestions.push(...topics.valley);
    }
    if (responseLower.includes("nile")) {
      allSuggestions.push(...topics.nile);
    }
    if (responseLower.includes("hieroglyph") || responseLower.includes("writing") || responseLower.includes("rosetta")) {
      allSuggestions.push(...topics.hieroglyphs);
    }
    
    // If no specific topics found, add some general questions
    if (allSuggestions.length === 0) {
      allSuggestions.push(
        "What was daily life like in ancient Egypt?",
        "How did ancient Egyptians view time?",
        "What was the role of women in ancient Egypt?",
        "How did ancient Egyptians trade with other civilizations?",
        "What was the education system like?",
        "How did ancient Egyptians measure time?",
        "What was the role of music in ancient Egypt?",
        "How did ancient Egyptians view foreigners?",
        "What was the role of magic in ancient Egypt?",
        "How did ancient Egyptians view the stars?"
      );
    }
    
    // Remove duplicates and shuffle the array
    const uniqueSuggestions = [...new Set(allSuggestions)];
    const shuffledSuggestions = uniqueSuggestions.sort(() => Math.random() - 0.5);
    
    // Return first 3 random suggestions
    return shuffledSuggestions.slice(0, 3);
  };

  useEffect(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.type === "user");
    const query = lastUserMessage ? lastUserMessage.content.toLowerCase() : "";

    const match = inputData.find((item) =>
      item.keywords.some((keyword) => query.includes(keyword.toLowerCase()))
    );

    const newImage = match ? match.img : pyramids;

    if (newImage !== backgroundImage) {
      setFade(true); // trigger fade-out

      setTimeout(() => {
        setBackgroundImage(newImage);
        setFade(false); // fade-in new background
      }, 400); // half of the transition duration
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    // Check for vague questions and provide guidance
    if (detectVagueQuestion(input) && messages.length === 0) {
      const guidanceMessage = {
        type: "bot",
        content: "I'd be happy to help! To get the most accurate answer, please be more specific about what you'd like to know. For example:\n\n• \"What does the Great Pyramid represent?\"\n• \"What does the Sphinx symbolize?\"\n• \"What does the Eye of Horus mean?\"\n\nWhat specific aspect of Egyptian history would you like to learn about?"
      };
      setMessages([guidanceMessage]);
      setInput("");
      return;
    }

    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to conversation
    saveMessageToConversation(userMessage);
    
    setInput("");
    setLoading(true);

    try {
      console.log("Sending question to API:", input.trim());

      let requestData;

      if (conversationFeaturesAvailable) {
        // Try to use conversation features
        const conversationId = localStorage.getItem("conversationId");
        
        requestData = {
          query: input.trim(),
          conversationId: conversationId,
          // Include recent conversation history for context
          conversationHistory: messages.slice(-4).map(msg => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content
          }))
        };
      } else {
        // Use simple query format
        requestData = input.trim();
      }

      const apiResponse = await api.askQuestion(requestData, conversationFeaturesAvailable);
      console.log("Raw API response:", apiResponse);

      // Extract only the answer text
      const answerText = extractAnswerText(apiResponse);
      console.log("Extracted answer text:", answerText);

      // Stream the response
      simulateStreaming(answerText);
    } catch (error) {
      console.error("Chat API error:", error);

      // If we get a 400 error and we were trying to use conversation features,
      // disable them for future requests
      if (error.response?.status === 400 && conversationFeaturesAvailable) {
        console.log("Conversation features not available, disabling for future requests");
        setConversationFeaturesAvailable(false);
        
        // Retry with simple query
        try {
          const simpleResponse = await api.askQuestion(input.trim());
          const answerText = extractAnswerText(simpleResponse);
          simulateStreaming(answerText);
          return;
        } catch (retryError) {
          console.error("Retry also failed:", retryError);
        }
      }

      const errorMessage = {
        type: "error",
        content:
          error.response?.data?.message ||
          error.message ||
          "Sorry, I encountered an error processing your request.",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };
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
      {/* <img src={backgroundChanger() || pyramids} alt="" className="imgCover" /> */}
      {/* <img src={backgroundImage} alt="" className="imgCover fade-bg" /> */}
      <img
        src={backgroundImage}
        alt=""
        className={`imgCover ${fade ? "fade-out" : ""}`}
      />

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
              
              {/* Render suggestions if available */}
              {msg.type === "suggestions" && msg.suggestions && (
                <div className="suggestions-container">
                  {msg.suggestions.map((suggestion, suggestionIndex) => (
                    <button
                      key={suggestionIndex}
                      className="suggestion-button"
                      onClick={() => {
                        setInput(suggestion);
                        // Auto-send the suggestion
                        setTimeout(() => {
                          const userMessage = { type: "user", content: suggestion };
                          setMessages((prev) => [...prev, userMessage]);
                          
                          // Save user message to conversation
                          saveMessageToConversation(userMessage);
                          
                          setInput("");
                          setLoading(true);
                          
                          // Send the suggestion to API
                          let requestData;
                          
                          if (conversationFeaturesAvailable) {
                            const conversationId = localStorage.getItem("conversationId");
                            requestData = {
                              query: suggestion,
                              conversationId: conversationId,
                              conversationHistory: messages.slice(-4).map(msg => ({
                                role: msg.type === "user" ? "user" : "assistant",
                                content: msg.content
                              }))
                            };
                          } else {
                            requestData = suggestion;
                          }
                          
                          api.askQuestion(requestData, conversationFeaturesAvailable)
                            .then((apiResponse) => {
                              const answerText = extractAnswerText(apiResponse);
                              simulateStreaming(answerText);
                            })
                            .catch((error) => {
                              console.error("Chat API error:", error);
                              
                              // If conversation features fail, retry with simple query
                              if (error.response?.status === 400 && conversationFeaturesAvailable) {
                                setConversationFeaturesAvailable(false);
                                api.askQuestion(suggestion, conversationFeaturesAvailable)
                                  .then((simpleResponse) => {
                                    const answerText = extractAnswerText(simpleResponse);
                                    simulateStreaming(answerText);
                                  })
                                  .catch((retryError) => {
                                    console.error("Retry also failed:", retryError);
                                    const errorMessage = {
                                      type: "error",
                                      content: "Sorry, I encountered an error processing your request.",
                                    };
                                    setMessages((prev) => [...prev, errorMessage]);
                                    setLoading(false);
                                  });
                              } else {
                                const errorMessage = {
                                  type: "error",
                                  content: "Sorry, I encountered an error processing your request.",
                                };
                                setMessages((prev) => [...prev, errorMessage]);
                                setLoading(false);
                              }
                            });
                        }, 100);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="message-wrapper bot-wrapper">
            <div className="avatar bot-avatar">
              <img src={icon} alt="Bot" />
            </div>
            <div className="message bot">
              <div className="message-content">{currentStreamedText}</div>
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
            disabled={!input.trim()}
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
