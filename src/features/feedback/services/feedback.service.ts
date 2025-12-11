import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of, throwError } from 'rxjs';
import { Message } from '../../../core/models/message.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  messages = signal<Message[]>([]);
  isLoading = signal(false);

  getMessages() {
    this.isLoading.set(true);
    this.http.get<Message[]>('/api/kv-proxy?action=getMessages').pipe(
      tap(messages => {
        this.messages.set(messages);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.error('Failed to fetch messages', err);
        this.toastService.show('获取留言失败', 'error');
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe();
  }

  addMessage(username: string, content: string) {
    this.isLoading.set(true);
    const params = new HttpParams()
      .set('action', 'addMessage')
      .set('username', username)
      .set('content', content);
      
    return this.http.post<Message>('/api/kv-proxy', null, { params }).pipe(
      tap(newMessage => {
        this.messages.update(messages => [newMessage, ...messages]);
        this.toastService.show('留言成功！', 'success');
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.error('Failed to add message', err);
        this.toastService.show('留言失败', 'error');
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }
}
