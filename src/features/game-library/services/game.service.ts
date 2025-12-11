import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from '../../../core/models/game.model';
import { ToastService } from '../../../core/services/toast.service';
import { INITIAL_GAMES } from '../data';
import { AiService } from '../../../core/ai/ai.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private toastService = inject(ToastService);
  private http = inject(HttpClient);
  private aiService = inject(AiService);
  private readonly webhookUrl = '/api/kv-proxy';
  private readonly likedGamesStorageKey = 'intell-game-liked-games';

  games = signal<Game[]>(INITIAL_GAMES);
  likedGames = signal<Set<number>>(new Set());

  // Signal to request opening the detail modal for a specific game
  openGameDetails = signal<Game | null>(null);

  constructor() {
    this.fetchGameLikes();
    afterNextRender(() => {
        this.loadLikedGamesFromStorage();
    });
  }

  private fetchGameLikes() {
    this.http.get<Record<string, number>>(`${this.webhookUrl}?action=getGameLikes`)
      .pipe(catchError((error) => {
        const message = (error as any)?.message || 'An unknown error occurred';
        console.error(`Failed to fetch game likes: ${message}`);
        return of({}); // Return empty object on error
      }))
      .subscribe(likes => {
        this.games.update(currentGames =>
          currentGames.map(game => ({
            ...game,
            likes: likes[game.id] || 0
          }))
        );
      });
  }
  
  private loadLikedGamesFromStorage() {
    const storedLiked = localStorage.getItem(this.likedGamesStorageKey);
    if (storedLiked) {
      try {
        this.likedGames.set(new Set(JSON.parse(storedLiked)));
      } catch {
        this.likedGames.set(new Set());
      }
    }
  }

  likeGame(gameToLike: Game) {
    if (this.likedGames().has(gameToLike.id)) {
      this.toastService.show('您已经为这款游戏点赞了', 'info');
      return;
    }
  
    // Optimistic UI update
    this.games.update(currentGames =>
      currentGames.map(game =>
        game.id === gameToLike.id ? { ...game, likes: (game.likes || 0) + 1 } : game
      )
    );
  
    // Update local state and persist
    this.likedGames.update(set => {
      set.add(gameToLike.id);
      localStorage.setItem(this.likedGamesStorageKey, JSON.stringify(Array.from(set)));
      return new Set(set);
    });
    
    // Send request to backend
    this.http.post(`${this.webhookUrl}?action=incrementGameLike`, { gameId: gameToLike.id })
      .pipe(catchError(err => {
        const message = (err as any)?.message || 'An unknown error occurred';
        console.error(`Failed to sync like with server: ${message}`);
        // Revert optimistic UI update
        this.games.update(currentGames =>
          currentGames.map(game =>
            game.id === gameToLike.id ? { ...game, likes: (game.likes || 1) - 1 } : game
          )
        );
        // Revert local state
        this.likedGames.update(set => {
          set.delete(gameToLike.id);
          localStorage.setItem(this.likedGamesStorageKey, JSON.stringify(Array.from(set)));
          return new Set(set);
        });
        this.toastService.show('点赞失败，请稍后重试', 'error');
        return of(null);
      }))
      .subscribe();
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
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const gameId = game.id;

    if (!this.aiService.isConfigured()) {
        return of(null);
    }

    return this.http.get<{ reason: string | null }>(`${this.webhookUrl}?action=getDailyReason&date=${dateString}&gameId=${gameId}`).pipe(
      switchMap(response => {
        if (response && response.reason) {
          return of(response.reason);
        }
        
        return from(this.aiService.generateDailyFocusReason(game.name)).pipe(
          tap(newReason => {
            if (newReason) {
              this.http.post(`${this.webhookUrl}?action=setDailyReason`, { date: dateString, gameId, reason: newReason })
                .subscribe({ error: err => {
                  const message = (err as any)?.message || 'An unknown error occurred';
                  console.error(`Failed to cache daily reason: ${message}`);
                }});
            }
          })
        );
      }),
      catchError(err => {
        const message = (err as any)?.message || 'An unknown error occurred';
        console.error(`Failed to get AI daily reason: ${message}`);
        return of(null);
      })
    );
  }
}