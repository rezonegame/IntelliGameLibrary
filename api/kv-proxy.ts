// This file is NOT part of the Angular app.
// It's a Node.js serverless function that Vercel will deploy.

import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

// Define Message type for type safety
interface Message {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  reply?: string;
  replyTimestamp?: string;
}

export default async function handler(request, response) {
  const { action } = request.query;

  try {
    switch (action) {
      case 'getVisitorCount': {
        const count = await kv.incr('visitorCount');
        return response.status(200).json({ count });
      }

      case 'getMessages': {
        const messageStrings: string[] = (await kv.lrange('messages', 0, -1)) || [];
        const messages: Message[] = messageStrings.map(s => JSON.parse(s));
        return response.status(200).json(messages);
      }
      
      case 'postMessage': {
        const { name, message } = request.body;
        if (!name || !message) {
          return response.status(400).json({ error: 'Name and message are required.' });
        }
        const newMessage: Message = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          name,
          message,
        };
        await kv.lpush('messages', JSON.stringify(newMessage));
        return response.status(201).json({ success: true, message: 'Message posted.' });
      }

      case 'postReply': {
        const { id, reply } = request.body;
        if (!id || !reply) {
            return response.status(400).json({ error: 'Message ID and reply are required.' });
        }
        const messageStrings: string[] = (await kv.lrange('messages', 0, -1)) || [];
        const messages: Message[] = messageStrings.map(s => JSON.parse(s));
        const messageIndex = messages.findIndex(msg => msg.id === id);

        if (messageIndex === -1) {
            return response.status(404).json({ error: 'Message not found.' });
        }
        
        const updatedMessage = {
            ...messages[messageIndex],
            reply,
            replyTimestamp: new Date().toISOString(),
        };

        await kv.lset('messages', messageIndex, JSON.stringify(updatedMessage));
        return response.status(200).json({ success: true, message: 'Reply posted.' });
      }

      case 'deleteMessage': {
        const { id } = request.body;
        if (!id) {
            return response.status(400).json({ error: 'Message ID is required.' });
        }
        const messageStrings: string[] = (await kv.lrange('messages', 0, -1)) || [];
        const messageToDeleteString = messageStrings.find(s => JSON.parse(s).id === id);

        if (!messageToDeleteString) {
             return response.status(404).json({ error: 'Message not found.' });
        }
        
        await kv.lrem('messages', 1, messageToDeleteString);
        return response.status(200).json({ success: true, message: 'Message deleted.' });
      }

      case 'getDailyReason': {
        const { date, gameId } = request.query;
        if (!date || !gameId) {
          return response.status(400).json({ error: 'Date and gameId are required.' });
        }
        const reason = await kv.get(`dailyReason:${date}:${gameId}`);
        return response.status(200).json({ reason });
      }

      case 'setDailyReason': {
        const { date, gameId, reason } = request.body;
        if (!date || !gameId || !reason) {
          return response.status(400).json({ error: 'Date, gameId, and reason are required.' });
        }
        await kv.set(`dailyReason:${date}:${gameId}`, reason);
        return response.status(200).json({ success: true });
      }

      case 'getGameLikes': {
        const likes = await kv.hgetall('gameLikes');
        return response.status(200).json(likes || {});
      }

      case 'incrementGameLike': {
        const { gameId } = request.body;
        if (!gameId) {
          return response.status(400).json({ error: 'gameId is required.' });
        }
        const newCount = await kv.hincrby('gameLikes', String(gameId), 1);
        return response.status(200).json({ success: true, newCount });
      }

      case 'logAnalytics': {
        const analyticsData = request.body;
        await kv.lpush('analyticsEvents', JSON.stringify(analyticsData));
        return response.status(200).json({ success: true });
      }

      case 'logIdea': {
        const ideaData = request.body;
        await kv.lpush('inspirationIdeas', JSON.stringify(ideaData));
        return response.status(200).json({ success: true });
      }

      default:
        return response.status(400).json({ error: 'Invalid action specified.' });
    }
  } catch (error) {
    console.error(`Error in kv-proxy for action "${action}":`, error);
    return response.status(500).json({ error: `An internal server error occurred.` });
  }
}