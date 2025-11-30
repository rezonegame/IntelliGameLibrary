/
// This file is NOT part of the Angular app.
// It's a Node.js serverless function that Vercel will deploy.
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

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
    const { gameName, date, randomTheme, randomMechanic } = JSON.parse(request.body);

    if (!gameName || !date || !randomTheme || !randomMechanic) {
      return response.status(400).json({ error: 'gameName, date, randomTheme, and randomMechanic are required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const reasonPrompt = `你是一位博学且富有创意的游戏史学家和推荐官。你的任务是为“今日聚焦”栏目撰写一句推荐语。今天是 ${date}。请深入挖掘今天与游戏《${gameName}》之间一个有趣或意想不到的关联（例如历史事件、名人轶事、文化现象、季节特征等）。然后，基于这个关联，创作一句能激发用户好奇心和游戏兴趣的推荐语，推荐语必须清晰且自然地体现出这个关联点。例如，若今天是某位象棋大师的生日，你可以说：“在纪念象棋大师卡斯帕罗夫诞辰的日子里，不妨在《国际象棋》的方寸之间，体验一场思维的较量。” 请直接返回最终的推荐语，不要包含任何额外的解释或前缀。`;
    const reasonPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: reasonPrompt,
        safetySettings,
    });

    const remodelPrompt = `你是一位创意世界构建师。请将经典游戏“${gameName}”重新设计为“${randomTheme}”主题。请以 JSON 格式精简回应，确保所有值为简体中文：{"newName": "新游戏名", "worldbuilding": "一段不超过40字的世界观设定"}。`;
    const remodelPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: remodelPrompt,
        config: { responseMimeType: 'application/json' },
        safetySettings,
    });

    const simulatePrompt = `你是一位资深游戏设计分析师。对于游戏“${gameName}”，请分析这条规则变更带来的影响：“引入‘${randomMechanic}’机制”。请以 JSON 格式精简回应，确保所有值为简体中文：{"impactOnStrategy": "对策略深度的影响（不超过25字）", "overallConclusion": "综合结论（不超过25字）"}。`;
    const simulatePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: simulatePrompt,
        config: { responseMimeType: 'application/json' },
        safetySettings,
    });
    
    // Use Promise.allSettled to handle individual promise failures gracefully
    const [reasonResult, remodelResult, simulateResult] = await Promise.allSettled([reasonPromise, remodelPromise, simulatePromise]);
    
    // Helper function to process reason result
    const getReason = () => {
        if (reasonResult.status === 'fulfilled') {
            return (reasonResult.value.text ?? '今天，就让这款经典游戏带你重温最纯粹的快乐吧！').trim();
        }
        console.error("Reason generation failed:", reasonResult.reason);
        // Check for specific API key error to provide a more helpful message
        if (reasonResult.reason?.message?.includes('API key not valid')) {
            return '无法获取AI推荐：API 密钥无效或已过期。';
        }
        return '无法获取AI推荐语。';
    };
    
    // Helper function to process remodel result
    const getRemodel = () => {
        const fallback = { newName: '加载失败', worldbuilding: '无法获取AI生成内容。' };
        if (remodelResult.status === 'fulfilled') {
            try {
                const text = (remodelResult.value.text ?? '').trim();
                return text ? JSON.parse(text) : fallback;
            } catch (e) {
                console.error('Failed to parse remodel JSON', e, `Raw text: "${remodelResult.value.text}"`);
                return fallback;
            }
        }
        console.error("Remodel generation failed:", remodelResult.reason);
        return { newName: '加载失败', worldbuilding: '主题改造示例生成失败。' };
    };

    // Helper function to process simulate result
    const getSimulate = () => {
        const fallback = { impactOnStrategy: '加载失败', overallConclusion: '无法获取AI生成内容。' };
        if (simulateResult.status === 'fulfilled') {
             try {
                const text = (simulateResult.value.text ?? '').trim();
                return text ? JSON.parse(text) : fallback;
            } catch (e) {
                console.error('Failed to parse simulate JSON', e, `Raw text: "${simulateResult.value.text}"`);
                return fallback;
            }
        }
        console.error("Simulate generation failed:", simulateResult.reason);
        return { impactOnStrategy: '加载失败', overallConclusion: '规则模拟示例生成失败。' };
    };

    const responsePayload = {
        dailyReason: getReason(),
        remodelResult: getRemodel(),
        simulateResult: getSimulate()
    };
    
    // Always return 200 OK, with success/failure indicated in the payload
    response.status(200).json(responsePayload);

  } catch (error: any) {
    // This catch block now handles errors before the API calls (e.g., JSON parsing of the request body)
    console.error('Error in serverless function handler:', error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}