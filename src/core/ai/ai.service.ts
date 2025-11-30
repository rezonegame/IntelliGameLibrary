import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { AiProvider, AiProviderType, AI_PROVIDERS } from './ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { UiService } from '../services/ui.service';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

const API_KEYS_STORAGE_ITEM = 'ai-api-keys';
const CUSTOM_ENDPOINTS_STORAGE_ITEM = 'ai-custom-endpoints';
const ACTIVE_PROVIDER_STORAGE_ITEM = 'ai-active-provider';

export interface DailyFocusData {
  dailyReason: string;
  remodelResult: { newName: string; worldbuilding: string };
  simulateResult: { impactOnStrategy: string; overallConclusion: string };
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private uiService = inject(UiService);
  private geminiProvider = inject(GeminiProvider);
  private openAiProvider = inject(OpenAIProvider);
  private deepSeekProvider = inject(DeepSeekProvider);
  private claudeProvider = inject(ClaudeProvider);
  
  private apiKeys = signal<Partial<Record<AiProviderType, string>>>({});
  private customEndpoints = signal<Partial<Record<AiProviderType, string>>>({});
  private activeProvider = signal<AiProvider | null>(null);
  activeProviderType = signal<AiProviderType>('deepseek');

  constructor() {
    this.loadStateFromStorage();

    // Smart provider switching: if the last active provider is not configured,
    // try to find any other configured provider and switch to it.
    const activeType = this.activeProviderType();
    if (!this.getApiKey(activeType)) {
        const firstConfiguredProvider = AI_PROVIDERS.find(p => this.getApiKey(p.id));
        if (firstConfiguredProvider) {
            this.activeProviderType.set(firstConfiguredProvider.id);
        }
    }

    this.switchProvider(this.activeProviderType());
  }

  private loadStateFromStorage() {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_ITEM);
    if (storedKeys) {
      try { this.apiKeys.update(keys => ({...keys, ...JSON.parse(storedKeys)})); } catch {}
    }

    const storedEndpoints = localStorage.getItem(CUSTOM_ENDPOINTS_STORAGE_ITEM);
    if (storedEndpoints) {
      try { this.customEndpoints.update(endpoints => ({...endpoints, ...JSON.parse(storedEndpoints)})); } catch {}
    }

    const storedProvider = localStorage.getItem(ACTIVE_PROVIDER_STORAGE_ITEM);
    if (storedProvider && AI_PROVIDERS.some(p => p.id === storedProvider)) {
      this.activeProviderType.set(storedProvider as AiProviderType);
    }
  }

  getApiKey(provider: AiProviderType): string {
    return this.apiKeys()[provider] || '';
  }

  getCustomEndpoint(provider: AiProviderType): string {
    return this.customEndpoints()[provider] || '';
  }

  async setApiKeyAndSwitch(providerId: AiProviderType, key: string, endpoint?: string): Promise<void> {
    this.apiKeys.update(keys => ({ ...keys, [providerId]: key }));
    localStorage.setItem(API_KEYS_STORAGE_ITEM, JSON.stringify(this.apiKeys()));

    if (providerId === 'custom' && endpoint) {
      this.customEndpoints.update(endpoints => ({ ...endpoints, [providerId]: endpoint }));
      localStorage.setItem(CUSTOM_ENDPOINTS_STORAGE_ITEM, JSON.stringify(this.customEndpoints()));
    }
    
    await this.switchProvider(providerId);
  }

  async deleteApiKey(providerId: AiProviderType): Promise<void> {
    this.apiKeys.update(keys => ({ ...keys, [providerId]: undefined }));
    localStorage.setItem(API_KEYS_STORAGE_ITEM, JSON.stringify(this.apiKeys()));
    
    if (this.activeProviderType() === providerId) {
      this.activeProvider.set(null);
      this.toastService.show(`${this.getProviderName(providerId)} API 密钥已删除，服务已停用`, 'info');
    } else {
      this.toastService.show(`${this.getProviderName(providerId)} API 密钥已删除`, 'info');
    }
  }

  async switchProvider(providerId: AiProviderType): Promise<void> {
    this.activeProviderType.set(providerId);
    localStorage.setItem(ACTIVE_PROVIDER_STORAGE_ITEM, providerId);
    this.activeProvider.set(null);

    const key = this.getApiKey(providerId);
    if (!key) {
      // Don't show toast on initial load
      return;
    }
    
    let providerInstance: AiProvider | null = null;
    let initPromise: Promise<boolean>;

    switch (providerId) {
      case 'gemini':
        providerInstance = this.geminiProvider;
        initPromise = providerInstance.init(key);
        break;
      case 'openai':
        providerInstance = this.openAiProvider;
        initPromise = (providerInstance as OpenAIProvider).init(key);
        break;
      case 'deepseek':
        providerInstance = this.deepSeekProvider;
        initPromise = providerInstance.init(key);
        break;
      case 'claude':
        providerInstance = this.claudeProvider;
        initPromise = providerInstance.init(key);
        break;
      case 'custom':
        providerInstance = this.openAiProvider;
        const endpoint = this.getCustomEndpoint('custom');
        if (!endpoint) {
          this.toastService.show('自定义 API 需要设置端点地址', 'error');
          return;
        }
        initPromise = (providerInstance as OpenAIProvider).init(key, endpoint);
        break;
      default:
        this.toastService.show(`暂不支持 ${this.getProviderName(providerId)}`, 'error');
        return;
    }

    if (providerInstance) {
      const success = await initPromise;
      if (success) {
        this.activeProvider.set(providerInstance);
        this.toastService.show(`${this.getProviderName(providerId)} 服务已成功初始化`, 'success');
      } else {
        this.activeProvider.set(null);
        this.toastService.show(`无效的API密钥或端点，${this.getProviderName(providerId)} 服务初始化失败`, 'error');
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
      this.uiService.openApiKeyModal();
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

  getDailyFocusData(gameName: string, date: string, randomTheme: string, randomMechanic: string): Observable<DailyFocusData> {
    const body = { gameName, date, randomTheme, randomMechanic };
    return this.http.post<DailyFocusData>('/api/generate-daily-reason', body)
      .pipe(
        catchError(error => {
          console.error('Failed to get daily focus data via proxy', error);
          this.toastService.show('获取每日聚焦内容失败', 'error');
          // Return a fallback object
          return of({
            dailyReason: '今天，就让这款经典游戏带你重温最纯粹的快乐吧！',
            remodelResult: { newName: '加载失败', worldbuilding: '无法获取AI生成内容。' },
            simulateResult: { impactOnStrategy: '加载失败', overallConclusion: '无法获取AI生成内容。' }
          });
        })
      );
  }

  testServerConnection(): Observable<{ success: boolean; message: string }> {
    return this.http.get<{ success: boolean; message:string }>('/api/test-gemini-key').pipe(
        tap(response => {
            this.toastService.show(response.message, response.success ? 'success' : 'error', 5000);
        }),
        catchError(error => {
            const message = error.error?.message || '测试请求失败，请检查网络或服务器函数日志。';
            this.toastService.show(message, 'error', 5000);
            console.error('Server connection test failed', error);
            return throwError(() => new Error(message));
        })
    );
  }
}