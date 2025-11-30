import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { AiService } from '../../ai/ai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AiProviderType, AI_PROVIDERS } from '../../ai/ai-provider.interface';
import { finalize } from 'rxjs';

type TestStatus = 'idle' | 'testing' | 'success' | 'failed';

@Component({
  selector: 'app-api-key-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg text-slate-800 m-4 border border-slate-200" (click)="$event.stopPropagation()">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-cyan-700">配置 AI 服务</h2>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
        </div>

        <div class="p-6">
            <div class="mb-5">
              <label for="provider-select" class="block text-sm font-medium text-slate-700 mb-2">选择 AI 提供商:</label>
              <select 
                id="provider-select"
                [ngModel]="selectedProvider()"
                (ngModelChange)="onProviderChange($event)"
                class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">
                @for (provider of providers; track provider.id) {
                  <option [value]="provider.id">{{ provider.name }}</option>
                }
              </select>
            </div>

            <p class="text-slate-600 mb-4 text-sm">
              为了使用 AI 功能，您需要提供所选服务商的 API 密钥。应用会将密钥安全地存储在您的浏览器本地。
            </p>

            @if (selectedProviderInfo()?.id !== 'custom') {
              <p class="text-slate-500 mb-5 text-sm">
                您可以从 <a [href]="selectedProviderInfo()?.getApiKeyUrl" target="_blank" class="text-cyan-600 hover:underline font-medium">{{ selectedProviderInfo()?.name }} 官方网站</a> 获取您的 API 密钥。
              </p>
            }

            @if (selectedProvider() === 'custom') {
              <div class="mb-4">
                <label for="custom-endpoint" class="block text-sm font-medium text-slate-700 mb-2">自定义 API 端点:</label>
                <input
                  id="custom-endpoint"
                  type="text"
                  #endpointInput
                  [value]="customEndpoint()"
                  (input)="onEndpointChange(endpointInput.value)"
                  placeholder="例如: http://localhost:1234/v1/chat/completions"
                  class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>
            }

            <div>
              <label for="api-key-input" class="block text-sm font-medium text-slate-700 mb-2">API 密钥:</label>
              <div class="flex items-center space-x-3">
                  <input 
                    id="api-key-input"
                    type="password"
                    #apiKeyInput
                    [value]="apiKey()"
                    (input)="onApiKeyChange(apiKeyInput.value)"
                    [placeholder]="'输入 ' + selectedProviderInfo()?.name + ' API 密钥'"
                    class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  @if (hasStoredKey() && apiKey() === getStoredKey()) {
                    <button 
                      (click)="deleteApiKey()"
                      title="删除已存储的密钥"
                      class="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200 transition-colors">
                      删除
                    </button>
                  }
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center">
              <button 
                  (click)="testConnection()"
                  class="relative px-5 py-2 border border-slate-300 text-slate-600 font-semibold rounded-md hover:bg-slate-100 transition-colors disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                  [disabled]="!canTest() || testStatus() === 'testing'">
                  @switch (testStatus()) {
                    @case ('idle') { <span>测试连接</span> }
                    @case ('testing') {
                      <svg class="animate-spin h-5 w-5 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span class="ml-2">测试中...</span>
                    }
                    @case ('success') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                      <span>连接成功</span>
                    }
                    @case ('failed') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                      <span>连接失败</span>
                    }
                  }
              </button>
              <button 
                  (click)="saveApiKey()"
                  class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
                  [disabled]="!canSave()">
                  保存并激活
              </button>
            </div>
            
            <div class="text-sm mt-3 h-5">
              @if (aiService.isConfigured() && aiService.activeProviderType() === selectedProvider()) {
                  <p class="text-emerald-600 font-medium">
                    {{ selectedProviderInfo()?.name }} 服务已激活。
                  </p>
              } @else if (hasStoredKey() && apiKey() === getStoredKey()) {
                  <p class="text-amber-600 font-medium">
                    {{ selectedProviderInfo()?.name }} 未激活，点击“保存并激活”以切换。
                  </p>
              } @else if (apiKey()) {
                 <p class="text-slate-500">密钥已输入，点击保存以激活。</p>
              } @else {
                  <p class="text-amber-600 font-medium">
                    {{ selectedProviderInfo()?.name }} 需要 API 密钥才能使用。
                  </p>
              }
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyModalComponent {
  aiService = inject(AiService);
  close = output();

  providers = AI_PROVIDERS;
  selectedProvider = signal<AiProviderType>(this.aiService.activeProviderType());
  apiKey = signal('');
  customEndpoint = signal('');
  testStatus = signal<TestStatus>('idle');

  hasStoredKey = computed(() => !!this.aiService.getApiKey(this.selectedProvider()));
  getStoredKey = () => this.aiService.getApiKey(this.selectedProvider());

  canTest = computed(() => this.apiKey() && (this.selectedProvider() !== 'custom' || this.customEndpoint()));
  canSave = computed(() => this.apiKey() && (this.selectedProvider() !== 'custom' || this.customEndpoint()));


  constructor() {
    this.onProviderChange(this.aiService.activeProviderType());
  }

  selectedProviderInfo = computed(() => this.providers.find(p => p.id === this.selectedProvider()));
  
  onProviderChange(providerId: AiProviderType) {
    this.selectedProvider.set(providerId);
    this.apiKey.set(this.aiService.getApiKey(providerId));
    if (providerId === 'custom') {
      this.customEndpoint.set(this.aiService.getCustomEndpoint('custom'));
    }
    this.testStatus.set('idle');
  }

  onApiKeyChange(value: string) {
    this.apiKey.set(value);
    this.testStatus.set('idle');
  }

  onEndpointChange(value: string) {
    this.customEndpoint.set(value);
    this.testStatus.set('idle');
  }

  testConnection() {
    if (!this.canTest()) return;

    this.testStatus.set('testing');
    this.aiService.testClientConnection(this.selectedProvider(), this.apiKey(), this.customEndpoint())
      .pipe(finalize(() => {
        if (this.testStatus() === 'testing') {
          // If the status hasn't been changed by the subscription, it means an error occurred.
          this.testStatus.set('failed');
        }
      }))
      .subscribe({
        next: (result) => {
          this.testStatus.set(result.success ? 'success' : 'failed');
        },
        error: () => {
          this.testStatus.set('failed');
        }
      });
  }

  async saveApiKey() {
    await this.aiService.setApiKeyAndSwitch(this.selectedProvider(), this.apiKey(), this.customEndpoint());
    this.close.emit();
  }

  async deleteApiKey() {
    await this.aiService.deleteApiKey(this.selectedProvider());
    this.apiKey.set('');
    this.testStatus.set('idle');
  }
}
