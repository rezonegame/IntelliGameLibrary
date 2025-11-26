import { Game } from '../models/game.model';

export type AiProviderType = 'gemini' | 'openai' | 'deepseek';

export const AI_PROVIDERS: { id: AiProviderType, name: string, getApiKeyUrl: string }[] = [
  { id: 'gemini', name: 'Google Gemini', getApiKeyUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'openai', name: 'OpenAI GPT', getApiKeyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'deepseek', name: 'DeepSeek', getApiKeyUrl: 'https://platform.deepseek.com/api_keys' },
];

export interface AiProvider {
  readonly providerId: AiProviderType;
  
  init(apiKey: string): Promise<boolean>;

  identifyGame(description: string): Promise<{ name: string; isPublicDomain: boolean; confidenceScore: number; analysis: string; fullGameData?: Game } | null>;
  
  fuseMechanics(mechanics: string[]): Promise<any>;

  remodelTheme(gameName: string, newTheme: string): Promise<any>;

  simulateRuleChange(gameName: string, ruleChange: string): Promise<any>;
}
