import { Component, input, output, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game()) {
      <div 
        (click)="viewDetails.emit()"
        class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 border border-slate-200 hover:border-cyan-400 transition-all duration-300 cursor-pointer group flex flex-col">
        <div class="h-44 overflow-hidden">
            <img [src]="game()!.image" [alt]="game()!.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-5 flex-grow flex flex-col">
          <h3 class="text-xl font-bold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">{{ game()!.name }}</h3>
          <p class="text-slate-500 mt-1 text-sm h-10 overflow-hidden flex-grow">{{ game()!.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs items-center justify-between">
            <div class="flex flex-wrap gap-2">
                <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.players.min }}-{{ game()!.players.max }} 人</span>
                <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.playTime.min }}-{{ game()!.playTime.max }} 分钟</span>
                <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.category }}</span>
            </div>
            <button (click)="likeGame($event)" [disabled]="isLiked()" [title]="isLiked() ? '已点赞' : '点赞'"
                    class="flex items-center gap-1.5 text-slate-400 disabled:text-red-500 hover:text-red-500 transition-colors focus:outline-none p-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" [attr.fill]="isLiked() ? 'currentColor' : 'none'" stroke="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                @if(likes() > 0) {
                    <span class="text-sm font-medium">{{ likes() }}</span>
                }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCardComponent {
  game = input.required<Game>();
  viewDetails = output();
  gameService = inject(GameService);

  isLiked = computed(() => this.gameService.likedGames().has(this.game().id));
  likes = computed(() => this.gameService.gameLikesCount()[this.game().id] || 0);

  likeGame(event: MouseEvent) {
    event.stopPropagation(); // Prevent card click from opening the detail modal
    this.gameService.likeGame(this.game());
  }
}