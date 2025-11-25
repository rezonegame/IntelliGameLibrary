
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Game } from '../../../../core/models/game.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game()) {
      <div 
        (click)="viewDetails.emit()"
        class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 border border-slate-200 hover:border-cyan-400 transition-all duration-300 cursor-pointer group">
        <div class="h-44 overflow-hidden">
            <img [src]="game()!.image" [alt]="game()!.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-5">
          <h3 class="text-xl font-bold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">{{ game()!.name }}</h3>
          <p class="text-slate-500 mt-1 text-sm h-10 overflow-hidden">{{ game()!.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.players.min }}-{{ game()!.players.max }} 人</span>
            <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.playTime.min }}-{{ game()!.playTime.max }} 分钟</span>
            <span class="bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{{ game()!.category }}</span>
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
}