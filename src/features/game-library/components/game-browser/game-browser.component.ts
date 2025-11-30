import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { GameService } from '../../services/game.service';
import { GameCardComponent } from '../game-card/game-card.component';
import { GameDetailModalComponent } from '../game-detail-modal/game-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameCardSkeletonComponent } from '../game-card-skeleton/game-card-skeleton.component';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-game-browser',
  standalone: true,
  imports: [GameCardComponent, GameDetailModalComponent, FormsModule, CommonModule, GameCardSkeletonComponent],
  template: `
<div class="p-6 md:p-10">
      
      <!-- Today's Focus -->
      @if (todayFocusGame(); as game) {
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-slate-800 mb-4">今日聚焦</h2>
          <div class="bg-gradient-to-r from-cyan-50 to-sky-100 p-6 rounded-xl shadow-sm border border-cyan-200/50 flex flex-col md:flex-row items-center gap-6 cursor-pointer transition-transform hover:scale-105" (click)="selectGame(game)">
            <img [src]="game.image" [alt]="game.name" 
              class="w-full md:w-48 h-48 object-cover rounded-lg shadow-md border-2 border-white">
            <div class="flex-1">
              <p class="text-sm font-semibold text-cyan-600">{{ game.category }}</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">{{ game.name }}</h3>
              
              <div class="mt-4 text-lg text-slate-700 border-l-4 border-cyan-400 pl-4 py-2">
                <p>{{ dailyReason() }}</p>
              </div>

              <div class="mt-4 flex flex-wrap gap-2 text-xs">
                <span class="bg-white/70 px-2 py-1 rounded-full text-slate-700 font-medium">{{ game.players.min }}-{{ game.players.max }} 人</span>
                <span class="bg-white/70 px-2 py-1 rounded-full text-slate-700 font-medium">{{ game.playTime.min }}-{{ game.playTime.max }} 分钟</span>
                <span class="bg-white/70 px-2 py-1 rounded-full text-slate-700 font-medium">{{ game.complexity }}</span>
              </div>
            </div>
          </div>

           <!-- AI Inspiration Quick-links -->
          @if(remodelSuggestion(); as remodel) {
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div (click)="requestInspiration('remodel')" class="p-4 bg-slate-100 hover:bg-cyan-100/50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-all group cursor-pointer">
                <h4 class="font-semibold text-slate-800 group-hover:text-cyan-700">改造此游戏主题</h4>
                <p class="text-sm text-slate-500 mt-1">将《{{ remodel.game.name }}》代入“{{ remodel.theme }}”主题会怎么样？</p>
              </div>
              @if(simulationSuggestion(); as simulation) {
                <div (click)="requestInspiration('simulate')" class="p-4 bg-slate-100 hover:bg-cyan-100/50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-all group cursor-pointer">
                  <h4 class="font-semibold text-slate-800 group-hover:text-cyan-700">模拟规则变更</h4>
                  <p class="text-sm text-slate-500 mt-1">为《{{ simulation.game.name }}》引入“{{ simulation.mechanic }}”机制会怎么样？</p>
                </div>
              }
            </div>
          }

        </div>
      }

      <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">游戏典藏</h2>
      <p class="text-slate-500 mb-8 text-lg">
        当前显示 {{filteredGames().length}} / {{gameService.games().length}} 款游戏。
      </p>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <!-- Search Input -->
          <div class="relative lg:col-span-2">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input 
              type="text"
              #searchInput
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="全局搜索游戏名称、描述、机制等..."
              class="w-full pl-10 pr-10 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              @if (searchTerm()) {
                <button (click)="searchTerm.set(''); searchInput.focus()" class="">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 hover:text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              }
            </div>
          </div>
          <!-- Players Filter -->
          <input 
            type="number"
            [ngModel]="playersFilter()"
            (ngModelChange)="playersFilter.set($event ? +$event : null)"
            placeholder="玩家人数"
            min="1"
            class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          >
          <!-- Complexity Filter -->
          <select 
            [ngModel]="complexityFilter()"
            (ngModelChange)="complexityFilter.set($event)"
            class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          >
              <option value="all">所有复杂度</option>
              @for(level of complexityLevels; track level.value) {
                <option [value]="level.value">{{ level.display }}</option>
              }
          </select>
          <!-- Category Filter -->
          <select 
            [ngModel]="categoryFilter()"
            (ngModelChange)="categoryFilter.set($event)"
            class="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          >
              <option value="all">所有类别</option>
              @for(cat of categories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
          </select>
          @if(hasActiveFilters()) {
            <button (click)="resetFilters()" class="lg:col-start-5 text-sm text-slate-500 hover:text-cyan-600 transition-colors">
              重置筛选
            </button>
          }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @if(isSearching()) {
          @for (_ of [1,2,3,4,5,6,7,8]; track _) {
            <app-game-card-skeleton></app-game-card-skeleton>
          }
        } @else {
          @for (game of filteredGames(); track game.id) {
            <app-game-card [game]="game" (viewDetails)="selectGame(game)"></app-game-card>
          } @empty {
            <div class="col-span-full text-center py-16">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <h3 class="mt-2 text-lg font-medium text-slate-800">未找到结果</h3>
              <p class="mt-1 text-base text-slate-500">请尝试调整您的筛选条件。</p>
            </div>
          }
        }
      </div>
    </div>
    
    @if (selectedGame()) {
      <app-game-detail-modal [game]="selectedGame()" (close)="clearSelectedGame()"></app-game-detail-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBrowserComponent {
  gameService = inject(GameService);
  uiService = inject(UiService);
  selectedGame = signal<Game | null>(null);

  // Filter state
  searchTerm = signal('');
  playersFilter = signal<number | null>(null);
  complexityFilter = signal('all');
  categoryFilter = signal('all');
  isSearching = signal(false);

  // UX signals for Today's Focus
  todayFocusGame = signal<Game | null>(null);
  dailyReason = signal<string>('');
  remodelSuggestion = signal<{ game: Game, theme: string } | null>(null);
  simulationSuggestion = signal<{ game: Game, mechanic: string } | null>(null);
  
  private randomThemes = ['赛博朋克', '深海探险', '古埃及神话', '太空歌剧', '丧尸末日', '蒸汽朋克', '美食王国'];

  complexityLevels = [
    { value: 'Very Low', display: '非常低' },
    { value: 'Low', display: '低' },
    { value: 'Medium', display: '中等' },
    { value: 'High', display: '高' },
    { value: 'Very High', display: '非常高' },
  ];
  
  categories = computed(() => [...new Set(this.gameService.games().map(g => g.category))].sort((a: string, b: string) => a.localeCompare(b, 'zh-Hans-CN')));
  allMechanics = computed(() => [...new Set(this.gameService.games().flatMap(g => g.mechanics))]);
  
  hasActiveFilters = computed(() => {
    return this.searchTerm() !== '' || this.playersFilter() !== null || this.complexityFilter() !== 'all' || this.categoryFilter() !== 'all';
  });

  filteredGames = computed(() => {
    const games = this.gameService.games();
    const term = this.searchTerm().toLowerCase();
    const players = this.playersFilter();
    const complexity = this.complexityFilter();
    const category = this.categoryFilter();

    if (!term && !players && complexity === 'all' && category === 'all') {
      return games;
    }

    return games.filter(game => {
      const playerMatch = !players || (game.players.min <= players && game.players.max >= players);
      const complexityMatch = complexity === 'all' || game.complexity === complexity;
      const categoryMatch = category === 'all' || game.category === category;
      
      if (!term) {
        return playerMatch && complexityMatch && categoryMatch;
      }
      
      const searchMatch =
          game.name.toLowerCase().includes(term) ||
          game.description.toLowerCase().includes(term) ||
          (game.originalName && game.originalName.toLowerCase().includes(term)) ||
          game.category.toLowerCase().includes(term) ||
          game.mechanics.some(m => m.toLowerCase().includes(term));

      return playerMatch && complexityMatch && categoryMatch && searchMatch;
    });
  });

  constructor() {
    this.initializeTodayFocus();

    // Effect to handle opening detail modal from an external request (e.g., shared link)
    effect(() => {
      const gameToOpen = this.gameService.openGameDetails();
      if (gameToOpen) {
        this.selectGame(gameToOpen);
        // Reset the signal to prevent re-opening on subsequent changes
        this.gameService.openGameDetails.set(null);
      }
    });

    // Effect for search loading UX
    effect((onCleanup) => {
      const term = this.searchTerm();
      if (!term) {
        this.isSearching.set(false);
        return;
      }

      this.isSearching.set(true);
      const timer = setTimeout(() => {
        this.isSearching.set(false);
      }, 400);

      onCleanup(() => clearTimeout(timer));
    });
  }

  private initializeTodayFocus() {
    const games = this.gameService.games();
    if (games.length === 0) return;

    // Stable selection based on date and season
    const today = new Date();
    const month = today.getMonth();
    const season = (month >= 2 && month <= 4) ? 'spring' :
                   (month >= 5 && month <= 7) ? 'summer' :
                   (month >= 8 && month <= 10) ? 'autumn' : 'winter';

    const seasonalGames = games.filter(g => g.tags?.includes(season));
    const pool = seasonalGames.length > 0 ? seasonalGames : games;
    
    const dayOfYear = (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 0)) / 86400000;
    const index = Math.floor(dayOfYear % pool.length);
    const game = pool[index];
    this.todayFocusGame.set(game);
    
    // Generate inspiration suggestions prompts
    this.generateInspirationSuggestions(game);
    
    // Generate local daily reason
    this.dailyReason.set(this.generateLocalDailyReason(game, season));
  }
  
  private generateLocalDailyReason(game: Game, season: string): string {
    // Prioritize tags
    if (game.tags?.includes(season)) {
      switch (season) {
        case 'spring': return `春回大地，万物复苏，不如在《${game.name}》中播下智慧的种子，静待策略之花绽放。`;
        case 'summer': return `炎炎夏日，最宜静心对弈。在《${game.name}》的世界里，寻找一份宁静的策略之乐。`;
        case 'autumn': return `秋意正浓，正是收获思考果实的季节。与朋友来一局《${game.name}》，享受思维碰撞的乐趣。`;
        case 'winter': return `冬日漫长，最适合与朋友围坐，来一局烧脑的《${game.name}》，点燃思维的火花。`;
      }
    }
    if (game.tags?.includes('sowing')) {
        return `在这充满希望的季节，最适合玩一局象征播种与收获的《${game.name}》，体验古老的农耕智慧。`;
    }

    // Fallback to category/complexity
    switch (game.category) {
      case '抽象策略':
        return `抛开繁杂的背景，今天就在《${game.name}》的棋盘上，来一场纯粹的智力体操吧！`;
      case '卡牌游戏':
        return `洗牌、发牌、出牌... 今天，就让《${game.name}》带你重温卡牌在指尖流转的经典魅力。`;
      case '竞赛游戏':
        return `目标就在前方！今天，就在《${game.name}》中体验冲向终点的紧张与刺激。`;
    }

    if (game.complexity === 'Very Low' || game.complexity === 'Low') {
      return `无需复杂规则，今天就在《${game.name}》中享受最直接、最纯粹的快乐吧！`;
    }

    // Generic fallback
    return `探索经典，品味智慧。今天，不妨沉下心来，体验一局《${game.name}》的独特魅力。`;
  }


  private generateInspirationSuggestions(game: Game) {
    const randomTheme = this.randomThemes[Math.floor(Math.random() * this.randomThemes.length)];
    this.remodelSuggestion.set({ game, theme: randomTheme });

    const mechanics = this.allMechanics();
    if (mechanics.length > 0) {
      const gameMechanics = new Set(game.mechanics);
      const potentialMechanics = mechanics.filter(m => !gameMechanics.has(m));
      const sourceMechanics = potentialMechanics.length > 0 ? potentialMechanics : mechanics;
      const randomMechanic = sourceMechanics[Math.floor(Math.random() * sourceMechanics.length)];
      this.simulationSuggestion.set({ game, mechanic: randomMechanic });
    }
  }

  requestInspiration(type: 'remodel' | 'simulate') {
    if (type === 'remodel') {
      const suggestion = this.remodelSuggestion();
      if (suggestion) {
        this.uiService.requestInspiration(suggestion.game, 'remodel', suggestion.theme);
      }
    } else {
      const suggestion = this.simulationSuggestion();
      if (suggestion) {
        const ruleText = `引入“${suggestion.mechanic}”机制`;
        this.uiService.requestInspiration(suggestion.game, 'simulate', ruleText);
      }
    }
  }

  selectGame(game: Game) {
    this.selectedGame.set(game);
  }

  clearSelectedGame() {
    this.selectedGame.set(null);
  }
  
  resetFilters() {
    this.searchTerm.set('');
    this.playersFilter.set(null);
    this.complexityFilter.set('all');
    this.categoryFilter.set('all');
  }
}