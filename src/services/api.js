// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Adjust if needed

const api = {
  // Upload PDF documents (without indexing)
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  // Index an uploaded document separately
  indexDocument: async (filename) => {
    try {
      const response = await axios.post(`${API_URL}/index`, { filename });
      return response.data;
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  },

  getIndexingStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/indexing-status`);
      return response.data;
    } catch (error) {
      console.error('Error getting indexing status:', error);
      throw error;
    }
  },

  // Query the RAG system
askQuestion: async (question) => {
  try {
    console.log("Making request to API with question:", question);
    
    const response = await axios.post(`${API_URL}/query`, 
      { question: question },
      { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    
    console.log("Raw axios response:", response);
    console.log("Response data type:", typeof response.data);
    
    // If response.data is a string that looks like JSON, parse it
    if (typeof response.data === 'string' && 
        (response.data.startsWith('{') || response.data.startsWith('['))) {
      try {
        return JSON.parse(response.data);
      } catch (e) {
        console.error("Failed to parse response data as JSON:", e);
        return response.data;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error querying RAG system:', error);
    throw error;
  }
},

  // Get list of documents
  getDocuments: async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
};

export default api;
