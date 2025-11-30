import { Injectable, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { Game } from '../../models/game.model';
import { AiProvider, AiProviderType } from '../ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class DeepSeekProvider implements AiProvider {
  readonly providerId: AiProviderType = 'deepseek';
  private toastService = inject(ToastService);
  private apiKey: string | null = null;
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';
  private readonly model = 'deepseek-chat';

  async init(apiKey: string): Promise<boolean> {
    this.apiKey = apiKey;
    return !!apiKey;
  }
  
  private async generateContent(prompt: string, isJson: boolean): Promise<any> {
    if (!this.apiKey) {
      throw new Error('DeepSeek Provider has no API Key.');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: isJson ? { type: 'json_object' } : { type: 'text' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('DeepSeek API Error:', errorData);
        const message = errorData.error?.message || '调用 DeepSeek API 时发生未知错误';
        this.toastService.show(message, 'error');
        throw new Error(message);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim() || '';

      if (isJson) {
        if (content) {
          return JSON.parse(content);
        } else {
          this.toastService.show('AI 返回了空的响应，无法解析', 'error');
          throw new Error('AI returned an empty response for a JSON request.');
        }
      }
      return content;

    } catch (error: any) {
      console.error('DeepSeek Fetch Error:', error);
       if (!error.message.includes('API')) {
         this.toastService.show('网络请求失败，请检查您的网络连接或API配置', 'error');
       }
      throw error;
    }
  }

  async identifyGame(description: string): Promise<{ name: string; isPublicDomain: boolean; confidenceScore: number; analysis: string; fullGameData?: Game } | null> {
    const prompt = `你是一位桌面游戏历史和设计专家。请分析以下描述：“${description}”。请以 JSON 格式回应，所有字符串值都必须是简体中文。JSON 对象必须包含以下字段：“name”（游戏名），“isPublicDomain”（是否为公共领域，布尔值），“confidenceScore”（置信度，0.0到1.0），“analysis”（分析摘要）。如果游戏属于公共领域，还需包含 “fullGameData” 对象。该对象必须符合此结构：{id: number, name: string, originalName?: string, image: string, description: string, players: {min: number, max: number}, playTime: {min: number, max: number}, complexity: string ('Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'), category: string, mechanics: string[], componentsDescription: string, historicalStory?: string, modificationSuggestion?: {themeSwaps: string[], mechanicFusions: string[]}, rules: {objective: string, setup: string, gameplay: string}, aiAnalysis: {coreFun: string, keyDecisions: string, potentialFlaws: string, designImpact: string}, variants: string[]}。id 应为一个较大的随机数。对于 image 字段，返回一个空字符串。对于 componentsDescription 字段，请提供详细的配件说明段落。对于 historicalStory 字段，请提供一段详实且有趣的史实或故事。对于 originalName，请提供游戏的原始或英文名称。对于 aiAnalysis.designImpact 字段，请在分析设计影响的同时，明确说明这款游戏可以锻炼或教授玩家的何种能力。对于 modificationSuggestion 对象，请在 themeSwaps 和 mechanicFusions 数组中分别提供至少两条丰富且有创意的改造建议。如果字段不适用，请省略。`;
    return this.generateContent(prompt, true);
  }

  async fuseMechanics(mechanics: string[]): Promise<any> {
    const prompt = `你是一位创意游戏设计师。请融合以下机制，构思一款新的桌面游戏：${mechanics.join('，')}。请以 JSON 格式提供一个详细的概念，所有字符串值都必须是简体中文，且 JSON 结构必须为：{"conceptName": "概念名称", "pitch": "一句话简介", "coreMechanics": "核心机制阐述", "gameplayLoop": "游戏流程", "components": ["所需配件列表"], "winningCondition": "胜利条件"}。`;
    return this.generateContent(prompt, true);
  }

  async remodelTheme(gameName: string, newTheme: string): Promise<any> {
    const prompt = `你是一位创意世界构建师。请将经典游戏“${gameName}”重新设计为“${newTheme}”主题。请以 JSON 格式回应，所有字符串值都必须是简体中文，且 JSON 结构必须为：{"newName": "新游戏名", "worldbuilding": "世界观设定", "componentRenaming": {"原始配件名": "新配件名"}, "thematicRuleVariants": ["符合新主题的规则变体建议列表"]}。`;
    return this.generateContent(prompt, true);
  }

  async simulateRuleChange(gameName: string, ruleChange: string): Promise<any> {
    const prompt = `你是一位资深游戏设计分析师。对于游戏“${gameName}”，请分析这条规则变更带来的影响：“${ruleChange}”。请以 JSON 格式回应，所有字符串值都必须是简体中文，且 JSON 结构必须为：{"impactOnStrategy": "对策略深度的影响", "impactOnBalance": "对游戏平衡性的影响", "impactOnPacing": "对游戏节奏的影响", "impactOnPlayerExperience": "对玩家体验的影响", "overallConclusion": "综合结论"}。`;
    return this.generateContent(prompt, true);
  }

  async generateDailyFocusReason(gameName: string): Promise<string> {
    const prompt = `你是一位充满激情的游戏推荐官。请为游戏《${gameName}》写一句富有创意、能激发人兴趣的推荐语，用于“今日聚焦”栏目。请直接返回这句推荐语，不要包含任何额外的前缀或解释。语言风格要生动、简洁、引人入胜。`;
    return this.generateContent(prompt, false);
  }
}