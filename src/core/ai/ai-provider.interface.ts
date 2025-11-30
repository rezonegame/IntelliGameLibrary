import { Game } from '../models/game.model';

export type AiProviderType = 'deepseek' | 'gemini' | 'openai' | 'claude' | 'custom';

export const AI_PROVIDERS: { id: AiProviderType, name: string, getApiKeyUrl: string }[] = [
  { id: 'deepseek', name: 'DeepSeek', getApiKeyUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'gemini', name: 'Google Gemini', getApiKeyUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'openai', name: 'OpenAI GPT', getApiKeyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'claude', name: 'Anthropic Claude', getApiKeyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'custom', name: '自定义 (OpenAI 兼容)', getApiKeyUrl: '#' },
];

export interface AiProvider {
  readonly providerId: AiProviderType;
  
  init(apiKey: string, baseUrl?: string): Promise<boolean>;

  testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean, message: string }>;

  identifyGame(description: string): Promise<{ name: string; isPublicDomain: boolean; confidenceScore: number; analysis: string; fullGameData?: Game } | null>;
  
  fuseMechanics(mechanics: string[]): Promise<any>;

  remodelTheme(gameName: string, newTheme: string): Promise<any>;

  simulateRuleChange(gameName: string, ruleChange: string): Promise<any>;

  generateDailyFocusReason(gameName: string): Promise<string>;
}
