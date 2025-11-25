
import { Injectable, signal, inject } from '@angular/core';
import { Game } from '../models/game.model';
import { ToastService } from './toast.service';
// FIX: Corrected import path for INITIAL_GAMES from the refactored data location.
import { INITIAL_GAMES } from '../features/game-library/data';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private toastService = inject(ToastService);
  games = signal<Game[]>(INITIAL_GAMES);

  addGame(game: Game) {
    if (this.games().some(g => g.name.toLowerCase() === game.name.toLowerCase())) {
        this.toastService.show(`游戏 "${game.name}" 已存在于资料库中。`, 'info');
        return;
    }

    this.games.update(games => [...games, game]);
    this.toastService.show(`"${game.name}" 已成功添加至资料库！`, 'success');
  }
}