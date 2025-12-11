import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  logEvent(eventName: string) {
    const params = new HttpParams()
      .set('action', 'logAnalytics')
      .set('event', eventName);

    // Fire and forget
    this.http.get('/api/kv-proxy', { params }).pipe(
      catchError(err => {
        console.error('Analytics log failed:', err);
        return of(null);
      })
    ).subscribe();
  }
}
