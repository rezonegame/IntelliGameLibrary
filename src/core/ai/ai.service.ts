import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AiProvider, AiProviderType, AI_PROVIDERS } from './ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';

const API_KEYS_STORAGE_ITEM = 'ai-api-keys';
const ACTIVE_PROVIDER_STORAGE_ITEM = 'ai-active-provider';

@Injectable({ providedIn: 'root' })
export class AiService {
  private toastService = inject(ToastService);
  private geminiProvider = inject(GeminiProvider);
  private openAiProvider = inject(OpenAIProvider);
  private deepSeekProvider = inject(DeepSeekProvider);
  
  private apiKeys = signal<Record<AiProviderType, string>>({ gemini: '', openai: '', deepseek: '' });
  private activeProvider = signal<AiProvider | null>(null);
  activeProviderType = signal<AiProviderType>('gemini');

  constructor() {
    this.loadStateFromStorage();
    this.switchProvider(this.activeProviderType());
  }

  private loadStateFromStorage() {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_ITEM);
    if (storedKeys) {
      try {
        const parsedKeys = JSON.parse(storedKeys);
        this.apiKeys.update(keys => ({...keys, ...parsedKeys}));
      } catch {
        // Use default if parsing fails
      }
    }
    const storedProvider = localStorage.getItem(ACTIVE_PROVIDER_STORAGE_ITEM);
    if (storedProvider && AI_PROVIDERS.some(p => p.id === storedProvider)) {
      this.activeProviderType.set(storedProvider as AiProviderType);
    }
  }

  getApiKey(provider: AiProviderType): string {
    return this.apiKeys()[provider] || '';
  }

  async setApiKeyAndSwitch(providerId: AiProviderType, key: string): Promise<void> {
    this.apiKeys.update(keys => ({ ...keys, [providerId]: key }));
    localStorage.setItem(API_KEYS_STORAGE_ITEM, JSON.stringify(this.apiKeys()));
    
    await this.switchProvider(providerId);
  }

  async switchProvider(providerId: AiProviderType): Promise<void> {
    this.activeProviderType.set(providerId);
    localStorage.setItem(ACTIVE_PROVIDER_STORAGE_ITEM, providerId);
    this.activeProvider.set(null); // Clear current provider

    const key = this.getApiKey(providerId);
    if (!key) {
      this.toastService.show(`${this.getProviderName(providerId)} 需要 API 密钥`, 'info');
      return;
    }
    
    let provider: AiProvider | null = null;
    switch (providerId) {
      case 'gemini':
        provider = this.geminiProvider;
        break;
      case 'openai':
        provider = this.openAiProvider;
        break;
      case 'deepseek':
        provider = this.deepSeekProvider;
        break;
      default:
        this.toastService.show(`暂不支持 ${this.getProviderName(providerId)}`, 'error');
        return;
    }

    if (provider) {
      const success = await provider.init(key);
      if (success) {
        this.activeProvider.set(provider);
        this.toastService.show(`${this.getProviderName(providerId)} 服务已成功初始化`, 'success');
      } else {
        this.toastService.show(`无效的API密钥，${this.getProviderName(providerId)} 服务初始化失败`, 'error');
      }
    }
  }

  isConfigured(): boolean {
    return !!this.activeProvider();
  }
  
  getProviderName(providerId: AiProviderType): string {
    return AI_PROVIDERS.find(p => p.id === providerId)?.name || '未知提供商';
  }

  private async execute<T>(action: (provider: AiProvider) => Promise<T>): Promise<T> {
    const provider = this.activeProvider();
    if (!provider) {
      const errorMessage = `当前 AI 服务 (${this.getProviderName(this.activeProviderType())}) 未配置`;
      this.toastService.show(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    return action(provider);
  }

  identifyGame(...args: Parameters<AiProvider['identifyGame']>) {
    return this.execute(p => p.identifyGame(...args));
  }
  
  fuseMechanics(...args: Parameters<AiProvider['fuseMechanics']>) {
    return this.execute(p => p.fuseMechanics(...args));
  }

  remodelTheme(...args: Parameters<AiProvider['remodelTheme']>) {
    return this.execute(p => p.remodelTheme(...args));
  }

  simulateRuleChange(...args: Parameters<AiProvider['simulateRuleChange']>) {
    return this.execute(p => p.simulateRuleChange(...args));
  }
}
