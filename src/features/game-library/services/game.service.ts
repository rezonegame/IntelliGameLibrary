import { Injectable, signal, inject } from '@angular/core';
import { Game } from '../../../core/models/game.model';
import { ToastService } from '../../../core/services/toast.service';
import { INITIAL_GAMES } from '../data';
import { AiService } from '../../../core/ai/ai.service';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private toastService = inject(ToastService);
  private aiService = inject(AiService);

  games = signal<Game[]>(INITIAL_GAMES);

  // Signal to request opening the detail modal for a specific game
  openGameDetails = signal<Game | null>(null);

  constructor() {
    // Likes functionality removed.
  }

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

  getAiDailyReason(game: Game): Observable<string | null> {
    if (!this.aiService.isConfigured()) {
        return of(null);
    }

    return from(this.aiService.generateDailyFocusReason(game.name)).pipe(
      catchError(err => {
        const message = (err as any)?.message || 'An unknown error occurred';
        console.error(`Failed to get AI daily reason: ${message}`);
        return of(null);
      })
    );
  }
}
