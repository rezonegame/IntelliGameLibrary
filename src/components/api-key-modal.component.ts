
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-api-key-modal',
  template: `
    @if (geminiService.isApiKeyModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" (click)="closeModal()">
        <div class="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg text-gray-200 border border-gray-700" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-indigo-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 017.743-5.743z" /></svg>
              输入您的 Gemini API 密钥
            </h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors text-3xl font-light">&times;</button>
          </div>
          <p class="mb-4 text-gray-400">
            AI 功能需要 Google Gemini API 密钥。您的密钥将被安全地存储在浏览器的本地存储中，绝不会上传至任何服务器。
          </p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">
            点此获取您的 API 密钥 &rarr;
          </a>
          <div class="flex flex-col space-y-4">
            <input 
              #apiKeyInput
              type="password" 
              placeholder="在此输入您的 API 密钥"
              [value]="currentApiKey()"
              (input)="currentApiKey.set(apiKeyInput.value)"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <div class="flex justify-end space-x-3">
               <button 
                (click)="saveKey()"
                class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                保存密钥
              </button>
              <button 
                (click)="closeModal()"
                class="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyModalComponent {
  geminiService = inject(GeminiService);
  currentApiKey = signal('');

  saveKey() {
    this.geminiService.setApiKey(this.currentApiKey());
  }

  closeModal() {
    this.geminiService.isApiKeyModalOpen.set(false);
  }
}
