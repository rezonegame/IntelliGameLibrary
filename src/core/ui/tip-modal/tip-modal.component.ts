import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-tip-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md text-slate-800 m-4 border border-slate-200 animate-fade-in-up" (click)="$event.stopPropagation()">
        
        <div class="p-5 border-b border-slate-200 flex justify-between items-center">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 class="text-xl font-bold text-cyan-700 ml-2">每日趣闻</h2>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
        </div>

        @if(game()) {
          <div class="p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-2">您知道吗？关于《{{ game()!.name }}》...</h3>
            <p class="text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-2">
              {{ game()!.historicalStory }}
            </p>
          </div>
        }

        <div class="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end items-center space-x-3">
            <button (click)="close.emit()"
                    class="px-5 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors">
              关闭
            </button>
            <button (click)="viewDetails.emit()"
                    class="px-5 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors">
              查看详情
            </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.2s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipModalComponent {
  game = input.required<Game>();
  close = output();
  viewDetails = output();
}
