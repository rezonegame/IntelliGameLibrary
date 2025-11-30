import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, tap, throwError, Observable } from 'rxjs';
import { Message } from '../../../core/models/message.model';

export interface NewMessage {
  name: string;
  message: string;
}

export interface NewReply {
  id: string;
  reply: string;
}

export interface InspirationIdea {
  timestamp: string;
  type: string;
  input: any;
  output: any;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http: HttpClient = inject(HttpClient);
  private toastService = inject(ToastService);
  
  private webhookUrl = '/api/proxy-google-script';

  private handleError(operation: string) {
    return (error: unknown): Observable<never> => {
      console.error(`${operation} failed`, error);
      this.toastService.show(`${operation}失败，请稍后重试`, 'error');
      return throwError(() => error);
    };
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.webhookUrl}?action=getMessages`).pipe(
      catchError(this.handleError('获取留言'))
    );
  }

  postMessage(message: NewMessage): Observable<any> {
    return this.http.post(`${this.webhookUrl}?action=postMessage`, message).pipe(
      tap(() => this.toastService.show('感谢您的留言！', 'success')),
      catchError(this.handleError('发送留言'))
    );
  }

  postReply(reply: NewReply): Observable<any> {
    return this.http.post(`${this.webhookUrl}?action=postReply`, reply).pipe(
      tap(() => this.toastService.show('回复已成功提交', 'success')),
      catchError(this.handleError('提交回复'))
    );
  }

  deleteMessage(id: string): Observable<any> {
    return this.http.post(`${this.webhookUrl}?action=deleteMessage`, { id }).pipe(
      tap(() => this.toastService.show('留言已删除', 'success')),
      catchError(this.handleError('删除留言'))
    );
  }

  logAnalyticsEvent(eventType: string, eventData: string): Observable<any> {
    const payload = { 
      timestamp: new Date().toISOString(),
      eventType, 
      eventData 
    };
    return this.http.post(`${this.webhookUrl}?action=logAnalytics`, payload).pipe(
      catchError(err => {
        console.error('Analytics log failed', err);
        return throwError(() => err);
      })
    );
  }

  logInspirationIdea(idea: InspirationIdea): Observable<any> {
    return this.http.post(`${this.webhookUrl}?action=logIdea`, idea).pipe(
      catchError(error => {
        console.error('Failed to log inspiration idea', error);
        return throwError(() => error);
      })
    );
  }
}
