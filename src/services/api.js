import axios from "axios";

const API_URL = "http://localhost:3001/api"; // Adjust if needed

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to extract main topic from conversation history
const extractTopicFromHistory = (conversationHistory) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return null;
  }

  // Look for key topics in the conversation history
  const topics = [
    'alexandria', 'pyramids', 'giza', 'sphinx', 'temple', 'pharaoh', 'cleopatra',
    'valley of the kings', 'karnak', 'luxor', 'abu simbel', 'philae', 'saqqara',
    'pompey', 'catacombs', 'roman', 'greco', 'egyptian', 'ancient egypt'
  ];

  // Search through all messages in history
  for (const message of conversationHistory) {
    const content = message.content.toLowerCase();
    
    // Find the most specific topic mentioned
    for (const topic of topics) {
      if (content.includes(topic)) {
        return topic;
      }
    }
    
    // Look for specific structures or places
    const specificMatches = content.match(/\b(great pyramid|sphinx|temple of|valley of|pharaoh|king|queen)\b/gi);
    if (specificMatches) {
      return specificMatches[0].toLowerCase();
    }
  }

  return null;
};

const api = {
  // Set auth token for subsequent requests
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  },

  // Add this in api.js
  login: async (data) => {
    try {
      const response = await axiosInstance.post(`/auth/login`, data);
      
      // Store the authentication token if it's in the response
      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        console.log("Authentication token stored successfully");
      } else if (response.data && response.data.accessToken) {
        localStorage.setItem("authToken", response.data.accessToken);
        console.log("Authentication token stored successfully");
      } else {
        console.log("No token found in login response:", response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  },

  signup: async (data) => {
    try {
      const response = await axiosInstance.post(`/auth/signup`, data);
      return response.data;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  },

  logout: () => {
    // Clear the authentication token and all related data
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("globalConversationLoaded");
    localStorage.removeItem("globalCurrentUserId");
    
    // Clear all conversation-related keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('conversationId_') || key.startsWith('global'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log("All authentication and conversation data cleared");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  // Conversation management
  getConversations: async () => {
    try {
      const response = await axiosInstance.get(`/chat/conversations`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  getConversation: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  },

  createConversation: async (data) => {
    try {
      const response = await axiosInstance.post(`/chat/conversations`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  addMessageToConversation: async (conversationId, messageData) => {
    try {
      const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error("Error adding message to conversation:", error);
      throw error;
    }
  },

  // Upload PDF documents (without indexing)
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axiosInstance.post(`/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  // Index an uploaded document separately
  indexDocument: async (filename) => {
    try {
      const response = await axiosInstance.post(`/index`, { filename });
      return response.data;
    } catch (error) {
      console.error("Error indexing document:", error);
      throw error;
    }
  },

  getIndexingStatus: async () => {
    try {
      const response = await axiosInstance.get(`/indexing-status`);
      return response.data;
    } catch (error) {
      console.error("Error getting indexing status:", error);
      throw error;
    }
  },

  // Query the RAG system
  askQuestion: async (questionOrRequest, useConversationFeatures = false) => {
    try {
      // Handle both simple string questions and complex request objects
      let requestData;
      let endpoint = "/query";
      
      if (typeof questionOrRequest === "string") {
        // Simple string query - backward compatibility
        requestData = { query: questionOrRequest };
      } else {
        // Complex request object with conversation context
        requestData = questionOrRequest;
        // Use conversation endpoint if conversationId is provided AND conversation features are enabled
        if (questionOrRequest.conversationId && useConversationFeatures) {
          endpoint = `/chat/conversations/${questionOrRequest.conversationId}/messages`;
          
          // Try formatting as a message object since backend expects role and content
          requestData = {
            role: "user",
            content: questionOrRequest.query
          };
          
          // Debug: Log the formatted conversation history
          console.log("Formatted conversation history for API:", questionOrRequest.conversationHistory);
          console.log("Request data being sent:", requestData);
          
          // Detailed debugging: Log each message structure
          if (questionOrRequest.conversationHistory) {
            questionOrRequest.conversationHistory.forEach((msg, index) => {
              console.log(`Message ${index}:`, {
                role: msg.role,
                content: msg.content,
                roleType: typeof msg.role,
                contentType: typeof msg.content,
                hasRole: !!msg.role,
                hasContent: !!msg.content
              });
            });
          }
        }
      }

      console.log("Making request to API with data:", requestData);

      try {
        // First try the conversation endpoint if specified
        const response = await axiosInstance.post(endpoint, requestData);
        console.log("Raw axios response:", response);
        console.log("Response data type:", typeof response.data);
        console.log("Full response data:", response.data);

        // Check if the response contains an AI answer or just the saved message
        if (response.data && response.data.answer) {
          // Response contains AI answer
          console.log("Conversation endpoint returned AI answer");
          return response.data;
        } else if (response.data && response.data.content && response.data.role === "user") {
          // Response is just the saved user message, need to get AI answer
          console.log("Conversation endpoint saved message, but no AI answer. This suggests the conversation endpoint doesn't return AI responses.");
          
          // The conversation endpoint only saves messages but doesn't return AI responses.
          // Since the backend RAG controller retrieves conversation history from the database
          // when conversationId is provided, we should use the conversationId in the query.
          
          // Use the regular query endpoint with the conversationId so the backend
          // will retrieve the conversation history from the database
          const queryData = {
            query: questionOrRequest.query,
            conversationId: questionOrRequest.conversationId
          };
          
          console.log("Getting AI response with conversationId:", queryData);
          const aiResponse = await axiosInstance.post("/query", queryData);
          console.log("AI response received:", aiResponse.data);
          
          return aiResponse.data;
        }

        // If response.data is a string that looks like JSON, parse it
        if (
          typeof response.data === "string" &&
          (response.data.startsWith("{") || response.data.startsWith("["))
        ) {
          try {
            return JSON.parse(response.data);
          } catch (e) {
            console.error("Failed to parse response data as JSON:", e);
            return response.data;
          }
        }

        return response.data;
      } catch (conversationError) {
        // If conversation endpoint fails, fall back to regular query endpoint
        if (endpoint !== "/query" && conversationError.response?.status === 400) {
          console.log("Conversation endpoint failed, falling back to regular query endpoint");
          console.log("Conversation error details:", conversationError.response?.data);
          
          // Extract query and enhance it with context if available
          let fallbackQuery = typeof questionOrRequest === "string" 
            ? questionOrRequest 
            : questionOrRequest.query;
          
          // If we have conversation history, enhance the query with context
          if (questionOrRequest.conversationHistory && questionOrRequest.conversationHistory.length > 0) {
            const lastUserMessage = questionOrRequest.conversationHistory
              .filter(msg => msg.role === "user")
              .slice(-1)[0];
            
            if (lastUserMessage && lastUserMessage.content) {
              // Enhance vague questions with context
              const vaguePatterns = [
                /^what (is|does) (it|this|that) (mean|represent|refer to)\??$/i,
                /^what (is|does) (it|this|that)\??$/i,
                /^when was (it|this|that) built\??$/i,
                /^where is (it|this|that)\??$/i,
                /^how (was|did) (it|this|that)\??$/i
              ];
              
              if (vaguePatterns.some(pattern => pattern.test(fallbackQuery))) {
                // Replace vague references with the actual topic from previous conversation
                const contextTopic = extractTopicFromHistory(questionOrRequest.conversationHistory);
                if (contextTopic) {
                  const originalQuery = fallbackQuery;
                  fallbackQuery = fallbackQuery.replace(/\b(it|this|that)\b/gi, contextTopic);
                  console.log(`Enhanced vague query: "${originalQuery}" → "${fallbackQuery}"`);
                }
              }
            }
          }
          
          const fallbackData = {
            query: fallbackQuery,
            chat_history: questionOrRequest.conversationHistory ? 
              questionOrRequest.conversationHistory
                .filter(msg => msg.role && msg.content) // Filter out messages without required fields
                .filter(msg => {
                  // Filter out assistant messages that are just follow-up suggestions
                  if (msg.role === 'assistant') {
                    const content = msg.content.toLowerCase();
                    return !content.includes('you might also want to ask') && 
                           !content.includes('follow-up') &&
                           !content.includes('suggestions');
                  }
                  return true;
                })
                .map(msg => ({
                  role: msg.role,
                  content: msg.content
                })) : []
          };
          
          console.log("Fallback query data with conversation history:", fallbackData);
          console.log("Filtered conversation history details:", fallbackData.chat_history.map((msg, index) => ({
            index,
            role: msg.role,
            content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '')
          })));
          console.log("Full request body being sent to /query endpoint:", JSON.stringify(fallbackData, null, 2));
          
          // Test: Let's also try sending the request with a different field name to see if that works
          const testData = {
            query: fallbackData.query,
            conversationHistory: fallbackData.chat_history // Try the original field name too
          };
          console.log("Also trying with conversationHistory field:", JSON.stringify(testData, null, 2));
          
          const fallbackResponse = await axiosInstance.post("/query", fallbackData);
          console.log("Fallback response:", fallbackResponse);
          
          // If response.data is a string that looks like JSON, parse it
          if (
            typeof fallbackResponse.data === "string" &&
            (fallbackResponse.data.startsWith("{") || fallbackResponse.data.startsWith("["))
          ) {
            try {
              return JSON.parse(fallbackResponse.data);
            } catch (e) {
              console.error("Failed to parse fallback response data as JSON:", e);
              return fallbackResponse.data;
            }
          }

          return fallbackResponse.data;
        } else {
          // Re-throw the error if it's not a 400 from conversation endpoint
          throw conversationError;
        }
      }
    } catch (error) {
      console.error("Error querying RAG system:", error);
      throw error;
    }
  },

  // Get list of documents
  getDocuments: async () => {
    try {
      const response = await axiosInstance.get(`/documents`);
      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  // Save chat message to database
  saveChatMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post(`/chat/messages`, messageData);
      return response.data;
    } catch (error) {
      // Silently ignore errors - chat should continue working even if saving fails
      console.log("Chat message saving not available (endpoint may not exist yet)");
      return null;
    }
  },

  // Get chat history for a user
  getChatHistory: async (userId) => {
    try {
      const response = await axiosInstance.get(`/chat/messages?userId=${userId}`);
      return response.data;
    } catch (error) {
      // Silently ignore errors - return empty array so chat continues working
      console.log("Chat history not available (endpoint may not exist yet)");
      return [];
    }
  },
};

export default api;
