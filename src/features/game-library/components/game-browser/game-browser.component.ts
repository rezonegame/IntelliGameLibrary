import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { GameService } from '../../services/game.service';
import { GameCardComponent } from '../game-card/game-card.component';
import { GameDetailModalComponent } from '../game-detail-modal/game-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-game-browser',
  standalone: true,
  imports: [GameCardComponent, GameDetailModalComponent, FormsModule, CommonModule],
  templateUrl: './game-browser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBrowserComponent {
  gameService = inject(GameService);
  analyticsService = inject(AnalyticsService);
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
    });

    // Effect to handle opening the detail modal from an external request
    effect(() => {
      const gameToOpen = this.gameService.openGameDetails();
      if (gameToOpen) {
        this.selectGame(gameToOpen);
        this.gameService.openGameDetails.set(null); // Reset the signal after handling
      }
    });
  }

  filteredGames = computed(() => {
    const games = this.gameService.games();
    const term = this.searchTerm().toLowerCase();
    const players = this.playersFilter();
    const complexity = this.complexityFilter();
    const category = this.categoryFilter();

    return games.filter(game => {
      const playerMatch = !players || (game.players.min <= players && game.players.max >= players);
      const complexityMatch = complexity === 'all' || game.complexity === complexity;
      const categoryMatch = category === 'all' || game.category === category;

      let termMatch = !term;
      if (term) {
        const searchableText = [
          game.name,
          game.originalName,
          game.description,
          game.componentsDescription,
          game.historicalStory,
          game.category,
          ...game.mechanics,
          ...game.variants,
          game.aiAnalysis.coreFun,
          game.aiAnalysis.keyDecisions,
          game.aiAnalysis.potentialFlaws,
          game.aiAnalysis.designImpact,
          ...(game.modificationSuggestion?.themeSwaps || []),
          ...(game.modificationSuggestion?.mechanicFusions || []),
        ].filter(Boolean).join(' ').toLowerCase();
        
        termMatch = searchableText.includes(term);
      }

      return termMatch && playerMatch && complexityMatch && categoryMatch;
    });
  });

  selectGame(game: Game) {
    this.selectedGame.set(game);
    this.analyticsService.logEvent('gameView', game.name);
  }

  clearSelectedGame() {
    this.selectedGame.set(null);
  }
}
