// api/generate-daily-reason.ts
// IMPORTANT: This file is NOT part of the Angular app.
// It's a Node.js serverless function that Vercel will deploy.
import { GoogleGenAI } from '@google/genai';

// Vercel automatically makes environment variables available via process.env
// The API key is securely stored in Vercel, not in the frontend code.
const apiKey = process.env.GEMINI_API_KEY;

// This function is the main handler for the serverless function.
// Vercel requires this default export format.
export default async function handler(request: any, response: any) {
  // Allow CORS for requests from your Vercel domain
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  if (!apiKey) {
    console.error('Gemini API key is not configured in Vercel environment variables.');
    return response.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  try {
    const { gameName } = JSON.parse(request.body);

    if (!gameName) {
      return response.status(400).json({ error: 'gameName is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `你是一位充满激情的游戏推荐官。请为游戏《${gameName}》写一句富有创意、能激发人兴趣的推荐语，用于“今日聚焦”栏目。请直接返回这句推荐语，不要包含任何额外的前缀或解释。语言风格要生动、简洁、引人入胜。`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    const text = result.text.trim();

    // Send the successful response back to the Angular app
    response.status(200).json({ reason: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    response.status(500).json({ error: 'Failed to generate content from AI.' });
  }
}
