import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { GameService } from '../services/game.service';
import { Game } from '../models/game.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';


@Component({
  selector: 'app-inspiration-workshop',
  imports: [FormsModule, CommonModule, LoaderComponent],
  template: `
    <div class="p-8 text-gray-200">
      <h2 class="text-3xl font-bold mb-2">灵感工坊</h2>
      <p class="text-gray-400 mb-6">由 AI 驱动的创意工具，激发你的下一个游戏设计灵感。</p>

      <div class="flex space-x-2 border-b border-gray-700 mb-6">
        @for (tab of tabs; track tab) {
          <button 
            (click)="activeTab.set(tab)"
            [class]="'px-4 py-2 font-semibold transition-colors ' + (activeTab() === tab ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-white')">
            {{ tab }}
          </button>
        }
      </div>

      <div class="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px]">
        @switch (activeTab()) {
          @case ('机制融合') {
            <div class="animate-fade-in">
              <h3 class="text-xl font-bold mb-4">机制融合器</h3>
              <p class="text-gray-400 mb-4">选择两种或多种游戏机制，让 AI 构思一个全新的游戏概念。</p>
              <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-900/50 rounded-md border border-gray-700">
                @for(mech of allMechanics(); track mech) {
                  <button 
                    (click)="toggleMechanic(mech)"
                    [class]="'px-3 py-1 rounded-full text-sm font-medium transition-colors ' + (selectedMechanics().includes(mech) ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-gray-700 hover:bg-gray-600')">
                    {{ mech }}
                  </button>
                }
              </div>
              <button 
                (click)="generateFusion()"
                [disabled]="isLoading() || selectedMechanics().length < 2"
                class="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex justify-center items-center">
                  @if (isLoading()) { <app-loader></app-loader> } @else { <span>融合机制</span> }
              </button>
            </div>
          }
          @case ('主题改造') {
            <div class="animate-fade-in">
                <h3 class="text-xl font-bold mb-4">主题改造器</h3>
                <p class="text-gray-400 mb-4">选择一款经典游戏，并为它赋予一个全新的主题皮肤。</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select [(ngModel)]="remodelGame" class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        @for(game of gameService.games(); track game.id) {
                            <option [value]="game.name">{{ game.name }}</option>
                        }
                    </select>
                    <input type="text" [(ngModel)]="remodelTheme" placeholder="输入新主题 (例如：赛博朋克, 古埃及)" class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <button (click)="generateRemodel()" [disabled]="isLoading() || !remodelGame || !remodelTheme" class="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex justify-center items-center">
                   @if (isLoading()) { <app-loader></app-loader> } @else { <span>改造主题</span> }
                </button>
            </div>
          }
          @case ('“假如”模拟器') {
            <div class="animate-fade-in">
                <h3 class="text-xl font-bold mb-4">“假如...”模拟器</h3>
                <p class="text-gray-400 mb-4">为一款游戏提出一个规则变更，看看 AI 如何分析其影响。</p>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select [(ngModel)]="whatIfGame" class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        @for(game of gameService.games(); track game.id) {
                            <option [value]="game.name">{{ game.name }}</option>
                        }
                    </select>
                    <input type="text" [(ngModel)]="whatIfRule" placeholder="输入规则变更 (例如：兵可以后退)" class="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <button (click)="generateSimulation()" [disabled]="isLoading() || !whatIfGame || !whatIfRule" class="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex justify-center items-center">
                   @if (isLoading()) { <app-loader></app-loader> } @else { <span>分析影响</span> }
                </button>
            </div>
          }
        }
      </div>

      @if (aiResult()) {
        <div class="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in border border-gray-700">
          <h3 class="text-2xl font-bold mb-4 text-indigo-400">AI 生成的概念</h3>
          <div class="whitespace-pre-wrap bg-gray-900/70 p-4 rounded-md text-gray-300 font-mono text-sm border border-gray-700">
            <pre>{{ formattedResult() }}</pre>
          </div>
        </div>
      }

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
  allMechanics = computed(() => [...new Set(this.gameService.games().flatMap(g => g.mechanics))].sort());
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