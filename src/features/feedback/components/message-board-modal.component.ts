import { Component, ChangeDetectionStrategy, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FeedbackService } from '../services/feedback.service';
import { LoaderComponent } from '../../../core/ui/loader/loader.component';

@Component({
  selector: 'app-message-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" (click)="close.emit()">
      <div class="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl text-slate-800 m-4 max-h-[80vh] flex flex-col border border-slate-200" (click)="$event.stopPropagation()">
        
        <div class="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-cyan-700">留言板</h2>
            <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
        </div>

        <div class="p-5 space-y-4">
          <textarea 
            [(ngModel)]="newMessage"
            placeholder="分享您的想法、建议或发现的游戏..."
            class="w-full h-24 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-base"
            [disabled]="feedbackService.isLoading()"
            maxlength="500"
          ></textarea>
          <div class="flex justify-between items-center">
            <input 
              type="text"
              [ngModel]="username()"
              (ngModelChange)="username.set($event)"
              placeholder="您的昵称"
              class="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition w-48 text-sm"
              [disabled]="feedbackService.isLoading()"
              maxlength="50"
            />
            <button 
              (click)="submitMessage()"
              [disabled]="feedbackService.isLoading() || !newMessage.trim() || !username().trim()"
              class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]">
                @if (feedbackService.isLoading() && !feedbackService.messages().length) {
                  <app-loader></app-loader>
                } @else {
                  <span>提交留言</span>
                }
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 border-t border-slate-200">
          <h3 class="font-bold text-lg mb-4 text-slate-700">最新留言</h3>
          @if (feedbackService.isLoading() && feedbackService.messages().length === 0) {
            <p class="text-slate-500 text-center py-8">正在加载留言...</p>
          } @else if (feedbackService.messages().length === 0) {
            <p class="text-slate-500 text-center py-8">还没有人留言，快来抢沙发吧！</p>
          } @else {
            <div class="space-y-5">
              @for (message of feedbackService.messages(); track message.id) {
                <div class="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm">
                  <p class="text-slate-700 text-base mb-2 break-words">{{ message.content }}</p>
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-semibold text-cyan-700">{{ message.username }}</span>
                    <span class="text-slate-400">{{ formatTimestamp(message.timestamp) }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBoardModalComponent implements OnInit {
  close = output();
  feedbackService = inject(FeedbackService);
  
  username = signal('');
  newMessage = '';

  ngOnInit() {
    this.feedbackService.getMessages();
    this.username.set(localStorage.getItem('intell-game-username') || '');
  }

  submitMessage() {
    const user = this.username().trim();
    const content = this.newMessage.trim();
    if (this.feedbackService.isLoading() || !user || !content) return;

    localStorage.setItem('intell-game-username', user);
    this.feedbackService.addMessage(user, content).subscribe({
      next: () => {
        this.newMessage = '';
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: zhCN });
  }
}