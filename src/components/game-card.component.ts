
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-game-card',
  template: `
    @if (game()) {
      <div 
        (click)="viewDetails.emit()"
        class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1.5 border border-transparent hover:border-indigo-500 transition-all duration-300 cursor-pointer group">
        <div class="h-40 overflow-hidden">
            <img [src]="game()!.image" [alt]="game()!.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-4">
          <h3 class="text-xl font-bold text-gray-100 group-hover:text-indigo-400 transition-colors truncate">{{ game()!.name }}</h3>
          <p class="text-gray-400 mt-1 text-sm h-10 overflow-hidden">{{ game()!.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span class="bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ game()!.players.min }}-{{ game()!.players.max }} 人</span>
            <span class="bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ game()!.playTime.min }}-{{ game()!.playTime.max }} 分钟</span>
            <span class="bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ game()!.category }}</span>
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
