import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS headers for development and production
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { action, username, content, event } = request.query;

  try {
    switch (action) {
      case 'getMessages': {
        const messages: Message[] = await kv.lrange('messages', 0, 50);
        return response.status(200).json(messages || []);
      }
      case 'addMessage': {
        if (!username || !content) return response.status(400).json({ error: 'username and content are required' });
        const newMessage: Message = {
          id: uuidv4(),
          username: String(username).substring(0, 50),
          content: String(content).substring(0, 500),
          timestamp: new Date().toISOString(),
        };
        await kv.lpush('messages', newMessage);
        await kv.ltrim('messages', 0, 99); // Keep last 100 messages
        return response.status(200).json(newMessage);
      }
      case 'logAnalytics': {
        if (!event) return response.status(400).json({ error: 'event is required' });
        const logKey = `analytics:${new Date().toISOString().split('T')[0]}`;
        await kv.hincrby(logKey, String(event), 1);
        return response.status(200).json({ success: true });
      }
      default:
        return response.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('KV Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return response.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
