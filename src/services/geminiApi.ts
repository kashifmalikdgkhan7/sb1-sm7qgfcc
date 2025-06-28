import { TalkoAI } from './talkoAI';

const GEMINI_API_KEY = 'AIzaSyD9J2mZLY3u5NCaUOx9QN_B2QkAwhKd764';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export class GeminiService {
  private static async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response from AI service');
      }

      const content = data.candidates[0].content.parts[0].text;
      return content || 'I apologize, but I couldn\'t generate a proper response. Please try again.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Authentication failed. Please contact support at +92 343 614 8715.');
      }
      
      if (error.message.includes('429')) {
        throw new Error('I\'m receiving too many requests right now. Please wait a moment and try again.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Access denied. Please contact SkillUp support at +92 343 614 8715.');
      }
      
      throw new Error('I encountered an issue processing your request. Please try again or contact SkillUp support at +92 343 614 8715.');
    }
  }

  static async generateResponse(prompt: string): Promise<string> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Please enter a message to continue our conversation.');
    }
    
    if (prompt.length > 8000) {
      throw new Error('Your message is quite long. Please keep it under 8000 characters for better processing.');
    }
    
    // Process the message through Talko AI personality
    const enhancedPrompt = TalkoAI.processUserMessage(prompt.trim());
    return await this.makeRequest(enhancedPrompt);
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.generateResponse('Hello');
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}