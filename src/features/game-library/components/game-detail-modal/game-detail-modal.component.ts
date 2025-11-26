import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game()) {
      <div class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40" (click)="close.emit()">
        <div class="bg-slate-50 rounded-xl shadow-2xl w-full max-w-5xl text-slate-800 m-4 max-h-[90vh] flex flex-col border border-slate-200" (click)="$event.stopPropagation()">
          
          <div class="p-6 border-b border-slate-200 flex justify-between items-start">
            <div>
              <h2 class="text-4xl font-bold text-cyan-700">
                {{ game()!.name }}
                @if(game()!.originalName) {
                  <span class="text-2xl text-slate-400 font-normal ml-2">{{ game()!.originalName }}</span>
                }
              </h2>
              <p class="text-slate-500 mt-1">{{ game()!.category }}</p>
            </div>
            <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
          </div>

          <div class="p-6 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-1">
                  <div class="relative group">
                    <img [src]="game()!.image" [alt]="game()!.name" class="w-full rounded-lg shadow-md mb-6 border border-slate-200">
                  </div>
                  <div class="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 class="font-bold text-lg mb-3 text-slate-700 border-b border-slate-200 pb-2">核心信息</h4>
                    <div class="space-y-2 text-slate-600">
                      <p><strong>玩家人数:</strong> {{ game()!.players.min }} - {{ game()!.players.max }} 人</p>
                      <p><strong>游戏时长:</strong> {{ game()!.playTime.min }} - {{ game()!.playTime.max }} 分钟</p>
                      <p><strong>复杂度:</strong> {{ game()!.complexity }}</p>
                    </div>
                  </div>
                  <div class="mt-4">
                    <h4 class="font-semibold text-base mb-2 text-slate-700">游戏机制</h4>
                    <div class="flex flex-wrap gap-2">
                        @for(mechanic of game()!.mechanics; track mechanic) {
                          <span class="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">{{ mechanic }}</span>
                        }
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2 space-y-6">
                  <div>
                    <h4 class="font-bold text-xl mb-2 text-slate-700">游戏简介</h4>
                    <p class="text-slate-600 leading-relaxed text-base">{{ game()!.description }}</p>
                  </div>

                  <div>
                    <h4 class="font-bold text-xl mb-2 text-slate-700">配件说明</h4>
                    <p class="text-slate-600 leading-relaxed text-base">{{ game()!.componentsDescription }}</p>
                  </div>

                  <div>
                    <h4 class="font-bold text-xl mb-3 text-slate-700">规则概述</h4>
                    <div class="space-y-4 text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                        <div>
                            <h5 class="font-semibold text-cyan-800">游戏目标</h5>
                            <p class="whitespace-pre-wrap pl-3 border-l-2 border-cyan-500/30 mt-1 text-base">{{ game()!.rules.objective }}</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-cyan-800">游戏设置</h5>
                            <p class="whitespace-pre-wrap pl-3 border-l-2 border-cyan-500/30 mt-1 text-base">{{ game()!.rules.setup }}</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-cyan-800">游戏玩法</h5>
                            <p class="whitespace-pre-wrap pl-3 border-l-2 border-cyan-500/30 mt-1 text-base">{{ game()!.rules.gameplay }}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              
              @if(game()!.historicalStory) {
                <div class="mt-8 border-t border-slate-200 pt-8">
                    <h3 class="text-2xl font-bold text-cyan-700 mb-4">趣闻轶事</h3>
                    <div class="text-slate-600 leading-relaxed text-base whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-200">{{ game()!.historicalStory }}</div>
                </div>
              }

              <div class="mt-8 border-t border-slate-200 pt-8">
                <h3 class="text-2xl font-bold text-cyan-700 mb-4">设计分析</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    @for(analysis of aiAnalysisItems(); track analysis.title) {
                      <div class="bg-white p-4 rounded-lg border border-slate-200">
                          <h5 class="font-semibold text-slate-800 mb-1 text-base">{{ analysis.title }}</h5>
                          <p class="text-slate-600">{{ analysis.content }}</p>
                      </div>
                    }
                </div>
              </div>

               @if(game()!.modificationSuggestion) {
                <div class="mt-8 border-t border-slate-200 pt-8">
                   <h3 class="text-2xl font-bold text-cyan-700 mb-4">改造建议</h3>
                   <div class="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
                      <div>
                          <h4 class="font-semibold text-slate-800 text-lg mb-2">主题套用</h4>
                          <ul class="list-disc list-inside text-slate-600 space-y-1.5 text-base">
                              @for(suggestion of game()!.modificationSuggestion!.themeSwaps; track $index) {
                                <li>{{ suggestion }}</li>
                              }
                          </ul>
                      </div>
                      <div class="pt-2">
                          <h4 class="font-semibold text-slate-800 text-lg mb-2">机制融合</h4>
                           <ul class="list-disc list-inside text-slate-600 space-y-1.5 text-base">
                              @for(suggestion of game()!.modificationSuggestion!.mechanicFusions; track $index) {
                                <li>{{ suggestion }}</li>
                              }
                          </ul>
                      </div>
                   </div>
                </div>
              }

               @if(game()!.variants.length > 0) {
                  <div class="mt-8 border-t border-slate-200 pt-8">
                     <h3 class="text-2xl font-bold text-cyan-700 mb-4">变体与扩展</h3>
                     <ul class="list-disc list-inside text-slate-600 space-y-1 text-base">
                        @for(variant of game()!.variants; track variant) {
                           <li>{{ variant }}</li>
                        }
                     </ul>
                  </div>
               }
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailModalComponent {
  game = input<Game | null>();
  close = output();

  aiAnalysisItems = computed(() => {
    const analysis = this.game()?.aiAnalysis;
    if (!analysis) return [];
    return [
      { title: '核心乐趣', content: analysis.coreFun },
      { title: '关键决策', content: analysis.keyDecisions },
      { title: '潜在缺陷', content: analysis.potentialFlaws },
      { title: '设计影响', content: analysis.designImpact },
    ];
  });
}
