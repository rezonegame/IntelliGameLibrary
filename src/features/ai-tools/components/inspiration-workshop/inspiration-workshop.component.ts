import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { AiService } from '../../../../core/ai/ai.service';
import { GameService } from '../../../game-library/services/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../core/ui/loader/loader.component';
import { UiService } from '../../../../core/services/ui.service';
import { FeedbackService, InspirationIdea } from '../../../feedback/services/feedback.service';


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
                      <select [ngModel]="remodelGame()" (ngModelChange)="remodelGame.set($event)" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                          @for(game of gameService.games(); track game.id) {
                              <option [value]="game.name">{{ game.name }}</option>
                          }
                      </select>
                      <input type="text" [ngModel]="remodelTheme()" (ngModelChange)="remodelTheme.set($event)" placeholder="输入新主题，如：赛博朋克、深海探险" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  </div>
                  <button (click)="generateRemodel()" [disabled]="isLoading() || !remodelGame() || !remodelTheme()" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
                     @if (isLoading()) { <app-loader></app-loader> } @else { <span>开始改造</span> }
                  </button>
              </div>
            }
            @case ('“假如”模拟器') {
              <div class="animate-fade-in">
                  <h3 class="text-xl font-bold mb-2 text-slate-700">“假如...”模拟器</h3>
                  <p class="text-slate-500 mb-6">为一款游戏提出一个规则变更，看看 AI 如何分析其对游戏性的深远影响。</p>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <select [ngModel]="whatIfGame()" (ngModelChange)="whatIfGame.set($event)" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                          @for(game of gameService.games(); track game.id) {
                              <option [value]="game.name">{{ game.name }}</option>
                          }
                      </select>
                      <input type="text" [ngModel]="whatIfRule()" (ngModelChange)="whatIfRule.set($event)" placeholder="输入规则变更，如：国际象棋的兵可以后退" class="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  </div>
                  <button (click)="generateSimulation()" [disabled]="isLoading() || !whatIfGame() || !whatIfRule()" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex justify-center items-center text-base">
                     @if (isLoading()) { <app-loader></app-loader> } @else { <span>分析影响</span> }
                  </button>
              </div>
            }
          }
        </div>

        @if (aiResult()) {
          <div class="mt-8 bg-white p-6 rounded-xl shadow-sm animate-fade-in border border-slate-200">
            <h3 class="text-2xl font-bold mb-4 text-cyan-700">AI 生成的概念</h3>
            <div class="space-y-6 text-slate-700 leading-relaxed">
              @switch (activeTab()) {
                @case ('机制融合') {
                  @if(aiResult().conceptName) {
                    <div>
                      <h4 class="text-lg font-semibold text-slate-800">{{ aiResult().conceptName }}</h4>
                      <p class="text-sm text-slate-500 italic mt-1 mb-3">"{{ aiResult().pitch }}"</p>
                      <div class="space-y-3 text-base text-slate-600">
                        <p><strong>核心机制:</strong> {{ aiResult().coreMechanics }}</p>
                        <p><strong>游戏流程:</strong> {{ aiResult().gameplayLoop }}</p>
                        <p><strong>胜利条件:</strong> {{ aiResult().winningCondition }}</p>
                        <div>
                          <strong class="block mb-1">所需配件:</strong>
                          <ul class="list-disc list-inside pl-2">
                            @for(item of aiResult().components; track item) { <li>{{ item }}</li> }
                          </ul>
                        </div>
                      </div>
                    </div>
                  }
                }
                @case ('主题改造') {
                  @if(aiResult().newName) {
                    <div>
                      <h4 class="text-lg font-semibold text-slate-800">{{ aiResult().newName }}</h4>
                      <p class="text-base mt-2"><strong>世界观设定:</strong> {{ aiResult().worldbuilding }}</p>
                      <div class="mt-3">
                        <strong class="block mb-1">配件重命名:</strong>
                        <ul class="list-disc list-inside pl-2 text-slate-600">
                          @for(item of objectKeys(aiResult().componentRenaming); track item) {
                            <li>{{ item }}: {{ aiResult().componentRenaming[item] }}</li>
                          }
                        </ul>
                      </div>
                      <div class="mt-3">
                        <strong class="block mb-1">主题规则变体:</strong>
                        <ul class="list-disc list-inside pl-2 text-slate-600">
                          @for(item of aiResult().thematicRuleVariants; track item) { <li>{{ item }}</li> }
                        </ul>
                      </div>
                    </div>
                  }
                }
                @case ('“假如”模拟器') {
                  @if(aiResult().impactOnStrategy) {
                    <div class="space-y-3 text-base text-slate-600">
                        <p><strong>策略影响:</strong> {{ aiResult().impactOnStrategy }}</p>
                        <p><strong>平衡性影响:</strong> {{ aiResult().impactOnBalance }}</p>
                        <p><strong>节奏影响:</strong> {{ aiResult().impactOnPacing }}</p>
                        <p><strong>玩家体验影响:</strong> {{ aiResult().impactOnPlayerExperience }}</p>
                        <div class="pt-3 mt-3 border-t border-slate-200">
                          <p class="font-semibold text-slate-700"><strong>综合结论:</strong> {{ aiResult().overallConclusion }}</p>
                        </div>
                    </div>
                  }
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspirationWorkshopComponent {
  aiService = inject(AiService);
  gameService = inject(GameService);
  uiService = inject(UiService);
  feedbackService = inject(FeedbackService);

  tabs = ['机制融合', '主题改造', '“假如”模拟器'];
  activeTab = signal(this.tabs[0]);
  isLoading = signal(false);
  aiResult = signal<any>(null);

  objectKeys = Object.keys;

  allMechanics = computed(() => [...new Set(this.gameService.games().flatMap(g => g.mechanics))].sort((a: string, b: string) => a.localeCompare(b, 'zh-Hans-CN')));
  selectedMechanics = signal<string[]>([]);
  
  remodelGame = signal('国际象棋');
  remodelTheme = signal('');

  whatIfGame = signal('国际跳棋');
  whatIfRule = signal('');

  constructor() {
    effect(() => {
      this.activeTab(); 
      this.aiResult.set(null);
    });

    effect(() => {
      const context = this.uiService.inspirationContext();
      if (context) {
        if (context.type === 'remodel') {
          this.activeTab.set('主题改造');
          this.remodelGame.set(context.game.name);
          this.remodelTheme.set(context.suggestion || '');
        } else if (context.type === 'simulate') {
          this.activeTab.set('“假如”模拟器');
          this.whatIfGame.set(context.game.name);
          this.whatIfRule.set(context.suggestion || '');
        }
      }
    });
  }

  toggleMechanic(mech: string) {
    this.selectedMechanics.update(mechs => 
      mechs.includes(mech) ? mechs.filter(m => m !== mech) : [...mechs, mech]
    );
  }

  private async runGeneration(generator: () => Promise<any>, type: string, input: any) {
      this.isLoading.set(true);
      this.aiResult.set(null);
      try {
          const res = await generator();
          this.aiResult.set(res);
          const idea: InspirationIdea = {
            timestamp: new Date().toISOString(),
            type,
            input,
            output: res
          };
          this.feedbackService.logInspirationIdea(idea).subscribe();
      } catch (error) {
          console.error("生成失败", error);
      } finally {
          this.isLoading.set(false);
      }
  }

  generateFusion() {
    this.runGeneration(
      () => this.aiService.fuseMechanics(this.selectedMechanics()),
      'fusion',
      { mechanics: this.selectedMechanics() }
    );
  }

  generateRemodel() {
    this.runGeneration(
      () => this.aiService.remodelTheme(this.remodelGame(), this.remodelTheme()),
      'remodel',
      { game: this.remodelGame(), theme: this.remodelTheme() }
    );
  }

  generateSimulation() {
    this.runGeneration(
      () => this.aiService.simulateRuleChange(this.whatIfGame(), this.whatIfRule()),
      'simulation',
      { game: this.whatIfGame(), rule: this.whatIfRule() }
    );
  }
}
