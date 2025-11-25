
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Game } from '../models/game.model';
import { GameService } from '../services/game.service';
import { GameCardComponent } from './game-card.component';
import { GameDetailModalComponent } from './game-detail-modal.component';

@Component({
  selector: 'app-game-browser',
  imports: [GameCardComponent, GameDetailModalComponent],
  template: `
    <div class="p-8">
      <h2 class="text-3xl font-bold text-gray-200 mb-6">游戏资料库</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (game of gameService.games(); track game.id) {
          <app-game-card [game]="game" (viewDetails)="selectGame(game)"></app-game-card>
        } @empty {
          <p class="text-gray-400 col-span-full text-center py-10">未找到任何游戏。</p>
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

  selectGame(game: Game) {
    this.selectedGame.set(game);
  }

  clearSelectedGame() {
    this.selectedGame.set(null);
  }
}
