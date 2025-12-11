import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private http = inject(HttpClient);

  private readonly webhookUrl = '/api/kv-proxy';

  visitorCount = signal<number | null>(null);

  fetchAndIncrementCount(): void {
    this.http.get<{ count: number }>(`${this.webhookUrl}?action=getVisitorCount`)
      .pipe(
        catchError(error => {
          // Log a clear message instead of the raw error object.
          const message = (error as any)?.message || 'An unknown error occurred';
          console.error(`Failed to fetch visitor count: ${message}`);
          // Gracefully complete the stream on error.
          return EMPTY;
        })
      )
      .subscribe(response => {
        if (response && typeof response.count === 'number') {
          this.visitorCount.set(response.count);
        }
      });
  }
}