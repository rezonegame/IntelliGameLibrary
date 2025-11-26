import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { AiService } from '../../ai/ai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AiProviderType, AI_PROVIDERS } from '../../ai/ai-provider.interface';

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

            <p class="text-slate-600 mb-4">
              为了使用 AI 功能，您需要提供所选服务商的 API 密钥。应用会将密钥安全地存储在您的浏览器本地。
            </p>
             <p class="text-slate-500 mb-5 text-sm">
              您可以从 <a [href]="selectedProviderInfo()?.getApiKeyUrl" target="_blank" class="text-cyan-600 hover:underline font-medium">{{ selectedProviderInfo()?.name }} 官方网站</a> 获取您的 API 密钥。
            </p>
            <div class="flex items-center space-x-3">
                <input 
                  type="password"
                  #apiKeyInput
                  [value]="apiKey()"
                  (input)="apiKey.set(apiKeyInput.value)"
                  [placeholder]="'输入 ' + selectedProviderInfo()?.name + ' API 密钥'"
                  class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
                <button 
                  (click)="saveApiKey()"
                  class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
                  [disabled]="!apiKey()">
                  保存并激活
                </button>
            </div>
            
            <div class="text-sm mt-3 h-5">
              @if (aiService.isConfigured() && aiService.activeProviderType() === selectedProvider()) {
                  <p class="text-emerald-600">
                    {{ selectedProviderInfo()?.name }} 服务已激活。
                  </p>
              } @else if (apiKey()) {
                 <p class="text-slate-500">密钥已输入，点击保存以激活。</p>
              } @else {
                  <p class="text-amber-600">
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
  apiKey = signal(this.aiService.getApiKey(this.selectedProvider()));

  selectedProviderInfo = computed(() => this.providers.find(p => p.id === this.selectedProvider()));
  
  onProviderChange(providerId: AiProviderType) {
    this.selectedProvider.set(providerId);
    this.apiKey.set(this.aiService.getApiKey(providerId));
  }

  async saveApiKey() {
    await this.aiService.setApiKeyAndSwitch(this.selectedProvider(), this.apiKey());
    this.close.emit();
  }
}
