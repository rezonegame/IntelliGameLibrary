import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Game } from '../models/game.model';
import { GameService } from '../services/game.service';
import { GameCardComponent } from './game-card.component';
import { GameDetailModalComponent } from './game-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-browser',
  imports: [GameCardComponent, GameDetailModalComponent, FormsModule, CommonModule],
  template: `
    <div class="p-8">
      <h2 class="text-3xl font-bold text-gray-200 mb-2">游戏资料库</h2>
      <p class="text-gray-400 mb-6">探索、筛选并发现海量的公共领域游戏。</p>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-gray-800 rounded-lg shadow">
          <!-- Search Input -->
          <input 
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            placeholder="按名称搜索..."
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
          <!-- Players Filter -->
          <input 
            type="number"
            [ngModel]="playersFilter()"
            (ngModelChange)="playersFilter.set($event ? +$event : null)"
            placeholder="玩家人数"
            min="1"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
          <!-- Complexity Filter -->
          <select 
            [ngModel]="complexityFilter()"
            (ngModelChange)="complexityFilter.set($event)"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
              <option value="all">所有复杂度</option>
              @for(level of complexityLevels; track level) {
                <option [value]="level">{{ level }}</option>
              }
          </select>
          <!-- Category Filter -->
          <select 
            [ngModel]="categoryFilter()"
            (ngModelChange)="categoryFilter.set($event)"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
              <option value="all">所有类别</option>
              @for(cat of categories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
          </select>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (game of filteredGames(); track game.id) {
          <app-game-card [game]="game" (viewDetails)="selectGame(game)"></app-game-card>
        } @empty {
          <p class="text-gray-400 col-span-full text-center py-10">未找到符合条件的游戏。</p>
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
  
  complexityLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  categories = computed(() => [...new Set(this.gameService.games().map(g => g.category))].sort());

  filteredGames = computed(() => {
    const games = this.gameService.games();
    const term = this.searchTerm().toLowerCase();
    const players = this.playersFilter();
    const complexity = this.complexityFilter();
    const category = this.categoryFilter();

    return games.filter(game => {
      const termMatch = !term || game.name.toLowerCase().includes(term);
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
