import { Component, ChangeDetectionStrategy, output, inject, signal, computed, OnInit, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FeedbackService, NewMessage, NewReply } from '../services/feedback.service';
import { LoaderComponent } from '../../../core/ui/loader/loader.component';
import { Message } from '../../../core/models/message.model';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

type BoardView = 'list' | 'form' | 'reply';
const USER_NAME_KEY = 'intell-game-user-name';

@Component({
  selector: 'app-message-board-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, LoaderComponent],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg text-slate-800 m-4 border border-slate-200 flex flex-col h-[80vh]" (click)="$event.stopPropagation()">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center">
             @if (currentView() !== 'list') {
              <button (click)="switchToListView()" class="mr-3 text-cyan-600 hover:text-cyan-800 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            }
            <h2 class="text-2xl font-bold text-cyan-700">{{ title() }}</h2>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors text-3xl font-light">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto flex-grow bg-slate-50/50">
          @if(isLoading()) {
            <div class="h-full flex items-center justify-center"> <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div> </div>
          } @else {
            @switch (currentView()) {
              @case('list') {
                <div class="space-y-5">
                  @for (message of messages(); track message.id) {
                    <div class="bg-white p-4 rounded-lg border border-slate-200 text-base shadow-sm">
                      <div class="flex justify-between items-start">
                        <p class="font-semibold text-slate-700 break-all">{{ message.name }}</p>
                        <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <p class="text-xs text-slate-400 text-right">{{ formatTimestamp(message.timestamp) }}</p>
                            @if (isAdmin()) {
                                <button (click)="confirmDelete(message)" title="删除留言" class="text-slate-400 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                            }
                        </div>
                      </div>
                      <p class="mt-2 text-slate-600 whitespace-pre-wrap break-words">{{ message.message }}</p>

                      @if (message.reply) {
                        <div class="mt-3 pt-3 border-t border-slate-200">
                          <div class="flex justify-between items-start">
                            <p class="font-semibold text-cyan-700">{{ ADMIN_DISPLAY_NAME }} 回复</p>
                            <p class="text-xs text-slate-400 flex-shrink-0 ml-2">{{ formatTimestamp(message.replyTimestamp) }}</p>
                          </div>
                          <p class="mt-1 text-cyan-800/80 whitespace-pre-wrap break-words">{{ message.reply }}</p>
                        </div>
                      } @else if (isAdmin()) {
                        <div class="text-right mt-2">
                          <button (click)="startReply(message)" class="text-xs font-semibold text-cyan-600 hover:text-cyan-800">
                            回复
                          </button>
                        </div>
                      }
                    </div>
                  } @empty {
                    <p class="text-center text-slate-500 py-8">还没有留言，快来抢占第一个吧！</p>
                  }
                </div>
              }
              @case('form') {
                <form (ngSubmit)="postMessage()" #messageForm="ngForm" class="space-y-4">
                  <div>
                    <label for="name" class="block text-sm font-medium text-slate-700 mb-1">您的称呼 <span class="text-red-500">*</span></label>
                    <input id="name" name="name" type="text" [(ngModel)]="newMessage.name" required
                          (ngModelChange)="onNameChange($event)"
                          class="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          placeholder="我们该如何称呼您？">
                  </div>
                  <div>
                    <label for="message" class="block text-sm font-medium text-slate-700 mb-1">留言内容 <span class="text-red-500">*</span></label>
                    <textarea id="message" name="message" rows="5" [(ngModel)]="newMessage.message" required
                              class="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                              placeholder="请在此写下您的想法..."></textarea>
                  </div>
                </form>
              }
              @case('reply') {
                <div class="space-y-4">
                  <div class="bg-slate-100 p-3 rounded-lg border border-slate-200">
                    <p class="text-sm font-semibold text-slate-500">回复 {{ replyingToMessage()?.name }}:</p>
                    <p class="text-sm text-slate-600 mt-1 italic whitespace-pre-wrap break-words">"{{ replyingToMessage()?.message }}"</p>
                  </div>
                   <div>
                    <label for="reply-message" class="block text-sm font-medium text-slate-700 mb-1">回复内容 <span class="text-red-500">*</span></label>
                    <textarea id="reply-message" name="reply-message" rows="5" [(ngModel)]="newReply.reply" required
                              class="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                              placeholder="请在此输入您的回复..."></textarea>
                  </div>
                </div>
              }
            }
          }
        </div>

        <div class="p-4 bg-slate-100 border-t border-slate-200 rounded-b-xl text-right flex-shrink-0">
          @if (currentView() === 'list') {
            <button (click)="switchToFormView()"
                    class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors">
              发布新留言
            </button>
          } @else if (currentView() === 'form') {
            <button (click)="postMessage()"
                    class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed min-w-[120px] flex justify-center items-center"
                    [disabled]="isFormInvalid() || isPosting()">
              @if (isPosting()) { <app-loader></app-loader> } @else { <span>确认发布</span> }
            </button>
          } @else if (currentView() === 'reply') {
             <button (click)="postReply()"
                    class="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed min-w-[120px] flex justify-center items-center"
                    [disabled]="!newReply.reply.trim() || isPosting()">
              @if (isPosting()) { <app-loader></app-loader> } @else { <span>确认回复</span> }
            </button>
          }
        </div>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBoardModalComponent implements OnInit {
  close = output();
  private feedbackService = inject(FeedbackService);
  
  messages = signal<Message[]>([]);
  isLoading = signal(true);
  isPosting = signal(false);
  currentView = signal<BoardView>('list');
  replyingToMessage = signal<Message | null>(null);

  newMessage: NewMessage = { name: '', message: '' };
  newReply: NewReply = { id: '', reply: ''};

  private readonly ADMIN_SECRET_CODE = '小岛'; 
  readonly ADMIN_DISPLAY_NAME = 'Admin';

  // Get a signal reference to the NgForm directive instance from the template
  messageFormRef = viewChild<NgForm>('messageForm');
  
  isAdmin = computed(() => this.newMessage.name === this.ADMIN_SECRET_CODE);

  // Safely compute form validity using the viewChild reference
  isFormInvalid = computed(() => {
    const form = this.messageFormRef();
    if (this.currentView() === 'form') {
      // If in form view, the button should be disabled if the form doesn't exist yet or is invalid.
      return !form?.valid;
    }
    // In other views this specific button isn't shown, so its state doesn't matter.
    return false;
  });

  title = computed(() => {
    switch(this.currentView()) {
      case 'list': return '留言板';
      case 'form': return '发布新留言';
      case 'reply': return `回复 ${this.replyingToMessage()?.name}`;
      default: return '留言板';
    }
  });

  ngOnInit() {
    this.loadMessages();
    const storedName = localStorage.getItem(USER_NAME_KEY);
    if (storedName) {
      this.newMessage.name = storedName;
    }
  }

  loadMessages() {
    this.isLoading.set(true);
    this.feedbackService.getMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  switchToListView() {
    this.currentView.set('list');
    this.replyingToMessage.set(null);
  }

  switchToFormView() {
    this.currentView.set('form');
  }

  startReply(message: Message) {
    this.replyingToMessage.set(message);
    this.newReply = { id: message.id, reply: '' };
    this.currentView.set('reply');
  }

  onNameChange(name: string) {
    localStorage.setItem(USER_NAME_KEY, name);
  }

  postMessage() {
    if (this.isFormInvalid()) {
      return;
    }
    this.isPosting.set(true);
    
    const messageToSend: NewMessage = {
      name: this.isAdmin() ? this.ADMIN_DISPLAY_NAME : this.newMessage.name,
      message: this.newMessage.message
    };

    this.feedbackService.postMessage(messageToSend).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.newMessage.message = ''; // Clear only message
        this.currentView.set('list');
        this.loadMessages();
      },
      error: () => this.isPosting.set(false)
    });
  }

  postReply() {
    this.isPosting.set(true);
    this.feedbackService.postReply(this.newReply).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.switchToListView();
        this.loadMessages();
      },
      error: () => this.isPosting.set(false)
    });
  }

  confirmDelete(message: Message) {
    if (window.confirm(`您确定要永久删除“${message.name}”的这条留言吗？此操作不可撤销。`)) {
      this.deleteMessage(message);
    }
  }

  private deleteMessage(message: Message) {
    this.isLoading.set(true);
    this.feedbackService.deleteMessage(message.id).subscribe({
      next: () => {
        this.messages.update(currentMessages => currentMessages.filter(m => m.id !== message.id));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: zhCN });
    } catch (e) {
      console.error('Error formatting date:', timestamp, e);
      return '很久以前';
    }
  }
}