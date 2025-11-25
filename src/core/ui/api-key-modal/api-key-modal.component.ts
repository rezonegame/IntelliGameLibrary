import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-key-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg text-slate-800 m-4 border border-slate-200" (click)="$event.stopPropagation()">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-cyan-700">设置 Google Gemini API Key</h2>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
        </div>

        <div class="p-6">
            <p class="text-slate-600 mb-4">
              为了使用 AI 识别和灵感工坊功能，您需要提供自己的 Google Gemini API 密钥。应用会将密钥安全地存储在您的浏览器本地。
            </p>
             <p class="text-slate-500 mb-5 text-sm">
              您可以从 <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-cyan-600 hover:underline font-medium">Google AI Studio</a> 获取您的免费 API 密钥。
            </p>
            <div class="flex items-center space-x-3">
                <input 
                  type="password"
                  #apiKeyInput
                  [value]="apiKey()"
                  (input)="apiKey.set(apiKeyInput.value)"
                  placeholder="在此输入您的 API 密钥"
                  class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
                <button 
                  (click)="saveApiKey()"
                  class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
                  [disabled]="!apiKey()">
                  保存
                </button>
            </div>
             @if (geminiService.isConfigured()) {
                <p class="text-emerald-600 text-sm mt-3">API 密钥已设置并激活。</p>
             } @else {
                <p class="text-amber-600 text-sm mt-3">AI 功能需要 API 密钥才能使用。</p>
             }
        </div>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyModalComponent {
  geminiService = inject(GeminiService);
  close = output();

  apiKey = signal(this.geminiService.apiKey());

  saveApiKey() {
    this.geminiService.setApiKey(this.apiKey());
    this.close.emit();
  }
}
