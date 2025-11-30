import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked, afterNextRender } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { GameService } from '../../services/game.service';
import { GameCardComponent } from '../game-card/game-card.component';
import { GameDetailModalComponent } from '../game-detail-modal/game-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { GameCardSkeletonComponent } from '../game-card-skeleton/game-card-skeleton.component';
import { UiService } from '../../../../core/services/ui.service';
import { AiService } from '../../../../core/ai/ai.service';

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
          <div class="bg-gradient-to-br from-cyan-50 via-white to-sky-100 p-6 rounded-xl shadow-sm border border-cyan-200/50 flex flex-col md:flex-row items-center gap-8">
            <img [src]="game.image" [alt]="game.name" 
              class="w-full md:w-48 h-48 object-cover rounded-lg shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-105" 
              (click)="selectGame(game)">
            <div class="flex-1">
              <p class="text-sm font-semibold text-cyan-600 cursor-pointer" (click)="selectGame(game)">{{ game.category }}</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1 cursor-pointer" (click)="selectGame(game)">{{ game.name }}</h3>
              
              <div class="mt-3 text-base text-slate-600 italic border-l-4 border-cyan-200 pl-4 py-2 min-h-[5rem]">
                @if (dailyFocusReasonIsLoading()) {
                  <div class="space-y-2 animate-pulse">
                    <div class="h-4 bg-slate-200 rounded w-full"></div>
                    <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                } @else {
                  <p>"{{ dailyFocusReason() }}"</p>
                }
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
              <button (click)="requestInspiration('remodel')" class="text-left p-4 bg-slate-100 hover:bg-cyan-100/50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors group">
                <h4 class="font-semibold text-slate-800 group-hover:text-cyan-700">改造此游戏主题</h4>
                <p class="text-sm text-slate-500 mt-1">将《{{ remodel.game.name }}》代入“{{ remodel.theme }}”主题会怎么样？</p>
              </button>
              @if(simulationSuggestion(); as simulation) {
                <button (click)="requestInspiration('simulate')" class="text-left p-4 bg-slate-100 hover:bg-cyan-100/50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors group">
                  <h4 class="font-semibold text-slate-800 group-hover:text-cyan-700">模拟规则变更</h4>
                  <p class="text-sm text-slate-500 mt-1">为《{{ simulation.game.name }}》引入“{{ simulation.mechanic }}”机制会怎么样？</p>
                </button>
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
  analyticsService = inject(AnalyticsService);
  uiService = inject(UiService);
  aiService = inject(AiService);
  selectedGame = signal<Game | null>(null);

  // Filter state
  searchTerm = signal('');
  playersFilter = signal<number | null>(null);
  complexityFilter = signal('all');
  categoryFilter = signal('all');
  isSearching = signal(false);

  // UX signals
  todayFocusGame = signal<Game | null>(null);
  dailyFocusReason = signal<string>('');
  dailyFocusReasonIsLoading = signal(true);
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

    // Effect for search loading UX and analytics
    effect((onCleanup) => {
      const term = this.searchTerm();
      if (!term) {
        this.isSearching.set(false);
        return;
      }

      this.isSearching.set(true);
      const timer = setTimeout(() => {
        this.analyticsService.logEvent('search', term);
        this.isSearching.set(false);
      }, 400);

      onCleanup(() => clearTimeout(timer));
    });
  }

  private initializeTodayFocus() {
    const today = new Date().toISOString().split('T')[0];
    const games = this.gameService.games();
    if (games.length === 0) return;

    // Stable selection based on date
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % games.length;
    const game = games[index];
    this.todayFocusGame.set(game);
    
    // Generate AI suggestions
    this.generateInspirationSuggestions(game);
    
    // Fetch or get cached AI daily reason
    this.getDailyFocusReason(game, today);
  }

  private getDailyFocusReason(game: Game, today: string) {
    const cacheKey = `daily-focus-reason-${today}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { gameId, reason } = JSON.parse(cachedData);
      // Ensure cache is for the correct game of the day
      if (gameId === game.id) {
        this.dailyFocusReason.set(reason);
        this.dailyFocusReasonIsLoading.set(false);
        return;
      }
    }
    
    // If no valid cache, fetch from AI
    this.dailyFocusReasonIsLoading.set(true);
    this.aiService.generateDailyFocusReason(game.name).subscribe(reason => {
        this.dailyFocusReason.set(reason);
        localStorage.setItem(cacheKey, JSON.stringify({ gameId: game.id, reason }));
        this.dailyFocusReasonIsLoading.set(false);
    });
  }

  private generateInspirationSuggestions(game: Game) {
    afterNextRender(() => {
      untracked(() => {
        const randomTheme = this.randomThemes[Math.floor(Math.random() * this.randomThemes.length)];
        this.remodelSuggestion.set({ game, theme: randomTheme });

        const mechanics = this.allMechanics();
        if (mechanics.length > 0) {
          const gameMechanics = new Set(game.mechanics);
          const potentialMechanics = mechanics.filter(m => !gameMechanics.has(m));
          let randomMechanic = (potentialMechanics.length > 0 ? potentialMechanics : mechanics)[Math.floor(Math.random() * (potentialMechanics.length > 0 ? potentialMechanics.length : mechanics.length))];
          this.simulationSuggestion.set({ game, mechanic: randomMechanic });
        }
      });
    });
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
    this.analyticsService.logEvent('viewGameDetails', game.name);
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