
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { GameService } from '../services/game.service';
import { Game } from '../models/game.model';
import { LoaderComponent } from './loader.component';

@Component({
  selector: 'app-ai-identifier',
  imports: [LoaderComponent],
  template: `
    <div class="p-8 text-gray-200">
      <h2 class="text-3xl font-bold mb-2">AI 游戏识别器</h2>
      <p class="text-gray-400 mb-6">忘了游戏叫什么？没关系，在这里描述一下它的规则、配件，或者直接粘贴规则网址。</p>

      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <textarea 
          #descriptionInput
          (input)="description.set(descriptionInput.value)"
          [value]="description()"
          class="w-full h-40 p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 transition"
          placeholder="例如：“一个在棋盘上通过跳过对方棋子来吃子的游戏...”"
        ></textarea>
        <button 
          (click)="identifyGame()" 
          [disabled]="isLoading() || description().trim().length === 0"
          class="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex justify-center items-center">
            @if (isLoading()) {
              <app-loader></app-loader>
            } @else {
              <span>开始识别</span>
            }
        </button>
      </div>

      @if (result()) {
        <div class="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in border border-gray-700">
            <h3 class="text-2xl font-bold mb-4 text-indigo-400">识别结果</h3>
            <div class="space-y-3 text-gray-300">
                <p><strong>游戏名称:</strong> <span class="text-white font-semibold">{{ result()!.name }}</span></p>
                <p><strong>置信度:</strong> <span class="text-white font-semibold">{{ (result()!.confidenceScore * 100).toFixed(0) }}%</span></p>
                <p><strong>公共领域:</strong> <span [class]="result()!.isPublicDomain ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'">{{ result()!.isPublicDomain ? '是' : '否' }}</span></p>
                <div class="pt-2">
                  <p class="font-semibold mb-1"><strong>AI 分析:</strong></p> 
                  <p class="text-gray-400 leading-relaxed">{{ result()!.analysis }}</p>
                </div>
            </div>
            
            @if (result()!.isPublicDomain && result()!.fullGameData) {
              <button 
                (click)="addGameToLibrary()"
                class="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
                添加至资料库
              </button>
            }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiIdentifierComponent {
  geminiService = inject(GeminiService);
  gameService = inject(GameService);

  description = signal('');
  isLoading = signal(false);
  result = signal<{ name: string; isPublicDomain: boolean; confidenceScore: number; analysis: string; fullGameData?: Game } | null>(null);

  async identifyGame() {
    if (!this.description().trim()) return;

    this.isLoading.set(true);
    this.result.set(null);
    try {
      const res = await this.geminiService.identifyGame(this.description());
      this.result.set(res);
    } catch (error) {
      console.error("识别失败", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  addGameToLibrary() {
    if (this.result()?.fullGameData) {
      this.gameService.addGame(this.result()!.fullGameData!);
    }
  }
}
