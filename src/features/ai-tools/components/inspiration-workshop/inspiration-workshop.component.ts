import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { GeminiService } from '../../../../core/services/gemini.service';
import { GameService } from '../../../game-library/services/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../core/ui/loader/loader.component';


@Component({
  selector: 'app-inspiration-workshop',
  standalone: true,
  imports: [FormsModule, CommonModule, LoaderComponent],
  template: `
    <div class="p-6 md:p-10">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">灵感工坊</h2>
        <p class="text-slate-500 mb-8 text-lg">借助 AI 的力量，探索游戏设计的无限可能。</p>

        <div class="flex space-x-2 border-b border-slate-200 mb-8">
          @for (tab of tabs; track tab) {
            <button 
              (click)="activeTab.set(tab)"
              [class]="'px-4 py-2 font-semibold transition-colors text-base ' + (activeTab() === tab ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-slate-500 hover:text-slate-800')">
              {{ tab }}
            </button>
          }
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm min-h-[350px] border border-slate-200">
          @switch (activeTab()) {
            @case ('机制融合') {
              <div class="animate-fade-in">
                <h3 class="text-xl font-bold mb-2 text-slate-700">机制融合器</h3>
                <p class="text-slate-500 mb-6">选择两种或多种游戏机制，让 AI 为您构思一款全新的游戏概念。</p>
                <div class="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
                  @for(mech of allMechanics(); track mech) {
                    <button 
                      (click)="toggleMechanic(mech)"
                      [class]="'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ' + (selectedMechanics().includes(mech) ? 'bg-cyan-500 text-white ring-2 ring-offset-1 ring-cyan-500' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')">
                      {{ mech }}
                    </button>
                  }
                </div>
                <button 
                  (click)="generateFusion()"
                  [disabled]="isLoading() || selectedMechanics().length < 2"
                  class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
                    @if (isLoading()) { <app-loader></app-loader> } @else { <span>融合机制</span> }
                </button>
              </div>
            }
            @case ('主题改造') {
              <div class="animate-fade-in">
                  <h3 class="text-xl font-bold mb-2 text-slate-700">主题改造器</h3>
                  <p class="text-slate-500 mb-6">选择一款经典游戏，并为它赋予一个全新的主题皮肤。</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <select [(ngModel)]="remodelGame" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                          @for(game of gameService.games(); track game.id) {
                              <option [value]="game.name">{{ game.name }}</option>
                          }
                      </select>
                      <input type="text" [(ngModel)]="remodelTheme" placeholder="输入新主题，如：赛博朋克、深海探险" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  </div>
                  <button (click)="generateRemodel()" [disabled]="isLoading() || !remodelGame || !remodelTheme" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
                     @if (isLoading()) { <app-loader></app-loader> } @else { <span>开始改造</span> }
                  </button>
              </div>
            }
            @case ('“假如”模拟器') {
              <div class="animate-fade-in">
                  <h3 class="text-xl font-bold mb-2 text-slate-700">“假如...”模拟器</h3>
                  <p class="text-slate-500 mb-6">为一款游戏提出一个规则变更，看看 AI 如何分析其对游戏性的深远影响。</p>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <select [(ngModel)]="whatIfGame" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                          @for(game of gameService.games(); track game.id) {
                              <option [value]="game.name">{{ game.name }}</option>
                          }
                      </select>
                      <input type="text" [(ngModel)]="whatIfRule" placeholder="输入规则变更，如：国际象棋的兵可以后退" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  </div>
                  <button (click)="generateSimulation()" [disabled]="isLoading() || !whatIfGame || !whatIfRule" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
                     @if (isLoading()) { <app-loader></app-loader> } @else { <span>分析影响</span> }
                  </button>
              </div>
            }
          }
        </div>

        @if (aiResult()) {
          <div class="mt-8 bg-white p-6 rounded-xl shadow-sm animate-fade-in border border-slate-200">
            <h3 class="text-2xl font-bold mb-4 text-cyan-700">AI 生成的概念</h3>
            <div class="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg text-slate-700 font-mono text-sm border border-slate-200">
              <pre>{{ formattedResult() }}</pre>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspirationWorkshopComponent {
  geminiService = inject(GeminiService);
  gameService = inject(GameService);

  tabs = ['机制融合', '主题改造', '“假如”模拟器'];
  activeTab = signal(this.tabs[0]);
  isLoading = signal(false);
  aiResult = signal<any>(null);

  // Mechanic Fusion state
  allMechanics = computed(() => [...new Set(this.gameService.games().flatMap(g => g.mechanics))].sort((a: string, b: string) => a.localeCompare(b, 'zh-Hans-CN')));
  selectedMechanics = signal<string[]>([]);
  
  // Theme Remodeler state
  remodelGame = '国际象棋';
  remodelTheme = '';

  // "What If" Simulator state
  whatIfGame = '国际跳棋';
  whatIfRule = '';
  
  formattedResult = computed(() => JSON.stringify(this.aiResult(), null, 2));

  constructor() {
    effect(() => {
      // This effect runs whenever activeTab() changes, clearing the previous result.
      this.activeTab(); 
      this.aiResult.set(null);
    });
  }

  toggleMechanic(mech: string) {
    this.selectedMechanics.update(mechs => 
      mechs.includes(mech) ? mechs.filter(m => m !== mech) : [...mechs, mech]
    );
  }

  private async runGeneration(generator: () => Promise<any>) {
      if (!this.geminiService.isConfigured()) {
        this.geminiService['toastService'].show('请先设置您的 API 密钥', 'error');
        return;
      }
      this.isLoading.set(true);
      this.aiResult.set(null);
      try {
          const res = await generator();
          this.aiResult.set(res);
      } catch (error) {
          console.error("生成失败", error);
      } finally {
          this.isLoading.set(false);
      }
  }

  generateFusion() {
    this.runGeneration(() => this.geminiService.fuseMechanics(this.selectedMechanics()));
  }

  generateRemodel() {
    this.runGeneration(() => this.geminiService.remodelTheme(this.remodelGame, this.remodelTheme));
  }

  generateSimulation() {
    this.runGeneration(() => this.geminiService.simulateRuleChange(this.whatIfGame, this.whatIfRule));
  }
}
