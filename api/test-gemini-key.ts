/
// This file is NOT part of the Angular app.
// It's a Node.js serverless function for Vercel to test the server-side API key.
import { GoogleGenAI } from '@google/genai';

// This function is the main handler for the serverless function.
// Vercel requires this default export format.
export default async function handler(request: any, response: any) {
  // Handle preflight OPTIONS request for CORS, now handled by vercel.json
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(400).json({ success: false, message: 'Vercel环境变量中未设置GEMINI_API_KEY。' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Make a very simple, low-cost call to verify the key
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hi' });
    
    return response.status(200).json({ success: true, message: 'Vercel上的Gemini API密钥有效且连接成功！' });
  } catch (error: any) {
    console.error('Gemini API test failed:', error);
    let errorMessage = '连接失败。';
    if (error.message?.includes('API key not valid')) {
        errorMessage = '连接失败：API密钥无效或已过期。';
    } else if (error.message) {
        errorMessage = `连接失败：${error.message}`;
    }
    return response.status(500).json({ success: false, message: errorMessage });
  }
}