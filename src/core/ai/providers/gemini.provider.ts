import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { ToastService } from '../../services/toast.service';
import { Game } from '../../models/game.model';
import { AiProvider, AiProviderType } from '../ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class GeminiProvider implements AiProvider {
  readonly providerId: AiProviderType = 'gemini';
  private toastService = inject(ToastService);
  private ai: GoogleGenAI | null = null;

  async init(apiKey: string): Promise<boolean> {
    try {
      this.ai = new GoogleGenAI({ apiKey });
      // We can do a lightweight check here in the future if needed
      return true;
    } catch (e) {
      console.error("初始化 Gemini AI 失败", e);
      this.ai = null;
      return false;
    }
  }

  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; }> {
    try {
      const testAi = new GoogleGenAI({ apiKey });
      await testAi.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hi' });
      return { success: true, message: 'Gemini 连接成功！' };
    } catch (error: any) {
      console.error('Gemini connection test failed:', error);
      let message = '连接失败。';
      if (error.message?.includes('API key not valid')) {
        message = '连接失败：API 密钥无效或已过期。';
      } else if (error.message) {
        message = `连接失败：${error.message}`;
      }
      return { success: false, message };
    }
  }

  private async generateContent(prompt: string, jsonSchema?: any): Promise<any> {
    if (!this.ai) {
      throw new Error('Gemini Provider 未初始化。');
    }
    
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: jsonSchema ? 'application/json' : undefined,
          responseSchema: jsonSchema,
          temperature: 0.7,
        },
      });

      const text = (response.text ?? '').trim();
      
      if (jsonSchema) {
        if (text) {
          return JSON.parse(text);
        } else {
          this.toastService.show('AI 返回了空的响应，无法解析', 'error');
          throw new Error('AI returned an empty response for a JSON request.');
        }
      }
      return text;
      
    } catch (error: any) {
      console.error('Gemini API 错误:', error);
      const message = error.message?.includes('API key not valid') 
        ? 'API 密钥无效，请检查您的密钥'
        : '调用 Gemini API 时发生错误';
      this.toastService.show(message, 'error');
      throw error;
    }
  }

  async identifyGame(description: string): Promise<{ name: string; isPublicDomain: boolean; confidenceScore: number; analysis: string; fullGameData?: Game } | null> {
    const prompt = `你是一位桌面游戏历史和设计专家。请分析以下描述：“${description}”。请以 JSON 格式回应，所有字符串值都必须是简体中文。JSON 对象必须包含以下字段：“name”（游戏名），“isPublicDomain”（是否为公共领域，布尔值），“confidenceScore”（置信度，0.0到1.0），“analysis”（分析摘要）。如果游戏属于公共领域，还需包含 “fullGameData” 对象。该对象必须符合此结构：{id: number, name: string, originalName?: string, image: string, description: string, players: {min: number, max: number}, playTime: {min: number, max: number}, complexity: string, category: string, mechanics: string[], componentsDescription: string, historicalStory?: string, modificationSuggestion?: {themeSwaps: string[], mechanicFusions: string[]}, rules: {objective: string, setup: string, gameplay: string}, aiAnalysis: {coreFun: string, keyDecisions: string, potentialFlaws: string, designImpact: string}, variants: string[]}。id 应为一个较大的随机数。对于 image 字段，返回一个空字符串。对于 componentsDescription 字段，请提供详细的配件说明段落。对于 historicalStory 字段，请提供一段详实且有趣的史实或故事。对于 originalName，请提供游戏的原始或英文名称。对于 aiAnalysis.designImpact 字段，请在分析设计影响的同时，明确说明这款游戏可以锻炼或教授玩家的何种能力。对于 modificationSuggestion 对象，请在 themeSwaps 和 mechanicFusions 数组中分别提供至少两条丰富且有创意的改造建议。如果字段不适用，请省略。`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        isPublicDomain: { type: Type.BOOLEAN },
        confidenceScore: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
        fullGameData: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.NUMBER }, 
                name: { type: Type.STRING }, 
                originalName: { type: Type.STRING },
                image: { type: Type.STRING },
                description: { type: Type.STRING },
                players: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } } },
                playTime: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } } },
                complexity: { type: Type.STRING }, 
                category: { type: Type.STRING },
                mechanics: { type: Type.ARRAY, items: { type: Type.STRING } },
                componentsDescription: { type: Type.STRING },
                historicalStory: { type: Type.STRING },
                modificationSuggestion: { 
                  type: Type.OBJECT,
                  properties: {
                    themeSwaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mechanicFusions: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                rules: {
                    type: Type.OBJECT,
                    properties: {
                        objective: { type: Type.STRING },
                        setup: { type: Type.STRING },
                        gameplay: { type: Type.STRING }
                    },
                    required: ["objective", "setup", "gameplay"]
                },
                aiAnalysis: {
                    type: Type.OBJECT,
                    properties: { 
                        coreFun: { type: Type.STRING }, 
                        keyDecisions: { type: Type.STRING }, 
                        potentialFlaws: { type: Type.STRING }, 
                        designImpact: { type: Type.STRING } 
                    }
                },
                variants: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
        },
      },
      required: ["name", "isPublicDomain", "confidenceScore", "analysis"]
    };

    return this.generateContent(prompt, schema);
  }
  
  async fuseMechanics(mechanics: string[]): Promise<any> {
    const prompt = `你是一位创意游戏设计师。请融合以下机制，构思一款新的桌面游戏：${mechanics.join('，')}。请以 JSON 格式提供一个详细的概念，所有字符串值都必须是简体中文：{"conceptName": "概念名称", "pitch": "一句话简介", "coreMechanics": "核心机制阐述", "gameplayLoop": "游戏流程", "components": ["所需配件列表"], "winningCondition": "胜利条件"}。`;
    const schema = {
      type: Type.OBJECT,
      properties: {
        conceptName: { type: Type.STRING },
        pitch: { type: Type.STRING },
        coreMechanics: { type: Type.STRING },
        gameplayLoop: { type: Type.STRING },
        components: { type: Type.ARRAY, items: { type: Type.STRING } },
        winningCondition: { type: Type.STRING },
      },
    };
    return this.generateContent(prompt, schema);
  }

  async remodelTheme(gameName: string, newTheme: string): Promise<any> {
    const prompt = `你是一位创意世界构建师。请将经典游戏“${gameName}”重新设计为“${newTheme}”主题。请以 JSON 格式回应，所有字符串值都必须是简体中文：{"newName": "新游戏名", "worldbuilding": "世界观设定", "componentRenaming": {"原始配件名": "新配件名"}, "thematicRuleVariants": ["符合新主题的规则变体建议列表"]}。`;
    const schema = {
      type: Type.OBJECT,
      properties: {
        newName: { type: Type.STRING },
        worldbuilding: { type: Type.STRING },
        componentRenaming: { type: Type.OBJECT, properties: { original: { type: Type.STRING } } },
        thematicRuleVariants: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    };
    return this.generateContent(prompt, schema);
  }

  async simulateRuleChange(gameName: string, ruleChange: string): Promise<any> {
    const prompt = `你是一位资深游戏设计分析师。对于游戏“${gameName}”，请分析这条规则变更带来的影响：“${ruleChange}”。请以 JSON 格式回应，所有字符串值都必须是简体中文：{"impactOnStrategy": "对策略深度的影响", "impactOnBalance": "对游戏平衡性的影响", "impactOnPacing": "对游戏节奏的影响", "impactOnPlayerExperience": "对玩家体验的影响", "overallConclusion": "综合结论"}。`;
    const schema = {
      type: Type.OBJECT,
      properties: {
        impactOnStrategy: { type: Type.STRING },
        impactOnBalance: { type: Type.STRING },
        impactOnPacing: { type: Type.STRING },
        impactOnPlayerExperience: { type: Type.STRING },
        overallConclusion: { type: Type.STRING },
      },
    };
    return this.generateContent(prompt, schema);
  }

  async generateDailyFocusReason(gameName: string): Promise<string> {
    const prompt = `你是一位充满激情的游戏推荐官。请为游戏《${gameName}》写一句富有创意、能激发人兴趣的推荐语，用于“今日聚焦”栏目。请直接返回这句推荐语，不要包含任何额外的前缀或解释。语言风格要生动、简洁、引人入胜。`;
    return this.generateContent(prompt);
  }
}
