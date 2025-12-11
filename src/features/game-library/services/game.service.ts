import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Game } from '../../../core/models/game.model';
import { ToastService } from '../../../core/services/toast.service';
import { INITIAL_GAMES } from '../data';
import { AiService } from '../../../core/ai/ai.service';
import { Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private aiService = inject(AiService);
  private readonly likedGamesStorageKey = 'intell-game-liked-games';

  games = signal<Game[]>(INITIAL_GAMES);
  likedGames = signal<Set<number>>(new Set());
  gameLikesCount = signal<Record<string, number>>({});

  // Signal to request opening the detail modal for a specific game
  openGameDetails = signal<Game | null>(null);

  constructor() {
    afterNextRender(() => {
        this.loadLikedGamesFromStorage();
        this.getGameLikes();
    });
  }

  private getGameLikes() {
    this.http.get<Record<string, number>>('/api/kv-proxy?action=getGameLikes').pipe(
      tap(likes => this.gameLikesCount.set(likes)),
      catchError(err => {
        console.error("Failed to fetch game likes", err);
        return of({});
      })
    ).subscribe();
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
  
    // Update local state and persist
    this.likedGames.update(set => {
      set.add(gameToLike.id);
      localStorage.setItem(this.likedGamesStorageKey, JSON.stringify(Array.from(set)));
      return new Set(set);
    });
    
    // Update remote state
    const params = new HttpParams().set('action', 'likeGame').set('gameId', gameToLike.id.toString());
    this.http.get<Record<string, number>>('/api/kv-proxy', { params }).pipe(
      tap(likes => {
        this.gameLikesCount.set(likes);
        this.toastService.show(`已点赞《${gameToLike.name}》`, 'success');
      }),
      catchError(err => {
        console.error("Failed to like game", err);
        this.toastService.show('点赞失败，请稍后再试', 'error');
        // Revert local state on error
        this.likedGames.update(set => {
          set.delete(gameToLike.id);
          localStorage.setItem(this.likedGamesStorageKey, JSON.stringify(Array.from(set)));
          return new Set(set);
        });
        return of(null);
      })
    ).subscribe();
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