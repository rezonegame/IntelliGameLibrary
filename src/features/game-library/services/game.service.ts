import { Injectable, signal, inject } from '@angular/core';
import { Game } from '../../../core/models/game.model';
import { ToastService } from '../../../core/services/toast.service';
import { INITIAL_GAMES } from '../data';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private toastService = inject(ToastService);
  games = signal<Game[]>(INITIAL_GAMES);

  addGame(game: Game) {
    if (this.games().some(g => g.name.toLowerCase() === game.name.toLowerCase())) {
        this.toastService.show(`游戏 "${game.name}" 已存在于典藏中`, 'info');
        return;
    }

    this.games.update(games => {
      const newGames = [...games, game];
      newGames.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN-u-co-pinyin'));
      return newGames;
    });
    this.toastService.show(`"${game.name}" 已成功添加至游戏典藏`, 'success');
  }
}
