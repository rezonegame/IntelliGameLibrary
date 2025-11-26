
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-game-detail-modal',
  template: `
    @if (game()) {
      <div class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-40" (click)="close.emit()">
        <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl text-gray-200 m-4 max-h-[90vh] flex flex-col border border-gray-700" (click)="$event.stopPropagation()">
          
          <div class="p-6 border-b border-gray-700 flex justify-between items-start">
            <h2 class="text-4xl font-bold text-indigo-400">{{ game()!.name }}</h2>
            <button (click)="close.emit()" class="text-gray-400 hover:text-white transition-colors text-3xl font-light">&times;</button>
          </div>

          <div class="p-6 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1">
                  <img [src]="game()!.image" [alt]="game()!.name" class="w-full rounded-lg shadow-md mb-4">
                  <div class="bg-gray-700/50 p-4 rounded-lg">
                    <h4 class="font-bold text-lg mb-3 text-gray-100 border-b border-gray-600 pb-2">核心信息</h4>
                    <div class="space-y-1 text-gray-300">
                      <p><strong>玩家人数:</strong> {{ game()!.players.min }} - {{ game()!.players.max }} 人</p>
                      <p><strong>游戏时长:</strong> {{ game()!.playTime.min }} - {{ game()!.playTime.max }} 分钟</p>
                      <p><strong>复杂度:</strong> {{ game()!.complexity }}</p>
                      <p><strong>类别:</strong> {{ game()!.category }}</p>
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2 space-y-5">
                  <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-100">游戏简介</h4>
                    <p class="text-gray-300 leading-relaxed">{{ game()!.description }}</p>
                  </div>

                  <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-100">配件说明</h4>
                    <p class="text-gray-300 leading-relaxed">{{ game()!.componentsDescription }}</p>
                  </div>
                  
                  @if(game()!.history) {
                    <div>
                        <h4 class="font-bold text-lg mb-2 text-gray-100">历史来源</h4>
                        <p class="text-gray-300 leading-relaxed">{{ game()!.history }}</p>
                    </div>
                  }

                  <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-100">规则概述</h4>
                    <div class="space-y-4 text-gray-300 leading-relaxed">
                        <div>
                            <h5 class="font-semibold text-indigo-300">游戏目标</h5>
                            <p class="whitespace-pre-wrap pl-2 border-l-2 border-indigo-400/30 mt-1">{{ game()!.rules.objective }}</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-indigo-300">游戏设置</h5>
                            <p class="whitespace-pre-wrap pl-2 border-l-2 border-indigo-400/30 mt-1">{{ game()!.rules.setup }}</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-indigo-300">游戏玩法</h5>
                            <p class="whitespace-pre-wrap pl-2 border-l-2 border-indigo-400/30 mt-1">{{ game()!.rules.gameplay }}</p>
                        </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-100">游戏机制</h4>
                    <div class="flex flex-wrap gap-2">
                        @for(mechanic of game()!.mechanics; track mechanic) {
                          <span class="bg-indigo-600/80 px-3 py-1 rounded-full text-sm font-medium">{{ mechanic }}</span>
                        }
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 border-t border-gray-700 pt-6">
                <h3 class="text-2xl font-bold text-indigo-400 mb-4">设计分析</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                        <h5 class="font-semibold text-gray-100 mb-1">核心乐趣</h5>
                        <p class="text-gray-300">{{ game()!.aiAnalysis.coreFun }}</p>
                    </div>
                    <div class="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                        <h5 class="font-semibold text-gray-100 mb-1">关键决策</h5>
                        <p class="text-gray-300">{{ game()!.aiAnalysis.keyDecisions }}</p>
                    </div>
                    <div class="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                        <h5 class="font-semibold text-gray-100 mb-1">潜在缺陷</h5>
                        <p class="text-gray-300">{{ game()!.aiAnalysis.potentialFlaws }}</p>
                    </div>
                    <div class="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                        <h5 class="font-semibold text-gray-100 mb-1">设计影响</h5>
                        <p class="text-gray-300">{{ game()!.aiAnalysis.designImpact }}</p>
                    </div>
                </div>
              </div>
               @if(game()!.variants.length > 0) {
                  <div class="mt-6 border-t border-gray-700 pt-6">
                     <h3 class="text-2xl font-bold text-indigo-400 mb-4">变体与扩展</h3>
                     <ul class="list-disc list-inside text-gray-300 space-y-1">
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
}
