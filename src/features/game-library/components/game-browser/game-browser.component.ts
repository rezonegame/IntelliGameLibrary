
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { GameService } from '../../services/game.service';
import { GameCardComponent } from '../game-card/game-card.component';
import { GameDetailModalComponent } from '../game-detail-modal/game-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-browser',
  standalone: true,
  imports: [GameCardComponent, GameDetailModalComponent, FormsModule, CommonModule],
  template: `
    <div class="p-6 md:p-10">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">游戏典藏</h2>
      <p class="text-slate-500 mb-8 text-lg">
        当前显示 {{filteredGames().length}} / {{gameService.games().length}} 款游戏。
      </p>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <!-- Search Input -->
          <div class="relative">
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
              placeholder="按中文或原文名称搜索..."
              class="w-full pl-10 pr-10 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              @if (isSearching()) {
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
              } @else if (searchTerm()) {
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
      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @for (game of filteredGames(); track game.id) {
          <app-game-card [game]="game" (viewDetails)="selectGame(game)"></app-game-card>
        } @empty {
          <div class="col-span-full text-center py-16">
            <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <h3 class="mt-2 text-lg font-medium text-slate-800">未找到结果</h3>
            <p class="mt-1 text-base text-slate-500">请尝试调整您的筛选条件。</p>
          </div>
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
  selectedGame = signal<Game | null>(null);

  // Filter state
  searchTerm = signal('');
  playersFilter = signal<number | null>(null);
  complexityFilter = signal('all');
  categoryFilter = signal('all');
  isSearching = signal(false);
  
  complexityLevels = [
    { value: 'Very Low', display: '极低' },
    { value: 'Low', display: '低' },
    { value: 'Medium', display: '中等' },
    { value: 'High', display: '高' },
    { value: 'Very High', display: '极高' }
  ];
  categories = computed(() => [...new Set(this.gameService.games().map(g => g.category))].sort());

  constructor() {
    let searchTimeout: any;
    effect(() => {
      const term = this.searchTerm();
      this.isSearching.set(true);
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        untracked(() => this.isSearching.set(false));
      }, 300);
    })
  }

  filteredGames = computed(() => {
    const games = this.gameService.games();
    const term = this.searchTerm().toLowerCase();
    const players = this.playersFilter();
    const complexity = this.complexityFilter();
    const category = this.categoryFilter();

    return games.filter(game => {
      const termMatch = !term || 
        game.name.toLowerCase().includes(term) ||
        (game.originalName && game.originalName.toLowerCase().includes(term));
      const playerMatch = !players || (game.players.min <= players && game.players.max >= players);
      const complexityMatch = complexity === 'all' || game.complexity === complexity;
      const categoryMatch = category === 'all' || game.category === category;
      return termMatch && playerMatch && complexityMatch && categoryMatch;
    });
  });

  selectGame(game: Game) {
    this.selectedGame.set(game);
  }

  clearSelectedGame() {
    this.selectedGame.set(null);
  }
}