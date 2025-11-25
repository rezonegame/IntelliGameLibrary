

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from '../../../../core/services/gemini.service';
import { GameService } from '../../../game-library/services/game.service';
import { Game } from '../../../../core/models/game.model';
import { LoaderComponent } from '../../../../core/ui/loader/loader.component';
import { CommonModule } from '@angular/common';
import { createRandomPlaceholderSVG } from '../../../game-library/data/placeholder';

type AddButtonState = 'idle' | 'adding';

@Component({
  selector: 'app-ai-identifier',
  standalone: true,
  imports: [LoaderComponent, CommonModule],
  template: `
    <div class="p-6 md:p-10">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">AI 游戏识别器</h2>
        <p class="text-slate-500 mb-8 text-lg">忘了一款游戏的名字？请在下方描述它的特征，AI 将为您探寻答案。</p>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <textarea 
            #descriptionInput
            (input)="description.set(descriptionInput.value)"
            [value]="description()"
            class="w-full h-40 p-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 transition text-base"
            placeholder="例如：“一款双人游戏，棋盘上有黑白两种圆片，通过夹住对方的棋子来翻转成自己的颜色...”"
          ></textarea>
          <button 
            (click)="identifyGame()" 
            [disabled]="isLoading() || description().trim().length === 0"
            class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
              @if (isLoading()) {
                <app-loader></app-loader>
              } @else {
                <span>开始识别</span>
              }
          </button>
        </div>

        @if (result()) {
          <div class="mt-8 bg-white p-6 rounded-xl shadow-sm animate-fade-in border border-slate-200">
              <h3 class="text-2xl font-bold mb-4 text-cyan-700">识别结果</h3>
              <div class="space-y-3 text-slate-600">
                  <p><strong>游戏名称:</strong> <span class="text-slate-800 font-semibold text-lg">{{ result()!.name }}</span></p>
                  <p><strong>置信度:</strong> <span class="text-slate-800 font-semibold">{{ (result()!.confidenceScore * 100).toFixed(0) }}%</span></p>
                  <p><strong>公共领域:</strong> <span [class]="result()!.isPublicDomain ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'">{{ result()!.isPublicDomain ? '是' : '否' }}</span></p>
                  <div class="pt-2">
                    <p class="font-semibold mb-1 text-slate-700"><strong>AI 分析:</strong></p> 
                    <p class="text-slate-500 leading-relaxed">{{ result()!.analysis }}</p>
                  </div>
              </div>
              
              @if (result()!.isPublicDomain && result()!.fullGameData) {
                <button 
                  (click)="addGameToLibrary()"
                  [disabled]="addButtonState() !== 'idle'"
                  class="mt-6 px-6 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 disabled:cursor-wait flex items-center justify-center min-w-[160px]">
                  @if (addButtonState() === 'idle') {
                    <span>添加至游戏典藏</span>
                  } @else {
                    <app-loader></app-loader>
                    <span class="ml-2">添加中...</span>
                  }
                </button>
              }
          </div>
        }
      </div>
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
  addButtonState = signal<AddButtonState>('idle');

  async identifyGame() {
    if (!this.description().trim()) return;
    if (!this.geminiService.isConfigured()) {
      this.geminiService['toastService'].show('请先设置您的 API 密钥', 'error');
      return;
    }

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
    const gameData = this.result()?.fullGameData;
    if (!gameData) return;

    this.addButtonState.set('adding');
    try {
      // Set the placeholder image
      const finalGameData = { ...gameData, image: createRandomPlaceholderSVG() };
      this.gameService.addGame(finalGameData);

      // Reset state
      this.result.set(null);
      this.description.set('');
    } catch (error) {
      console.error("添加游戏失败", error);
    } finally {
      this.addButtonState.set('idle');
    }
  }
}
