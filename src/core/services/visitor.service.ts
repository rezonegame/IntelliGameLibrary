import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private http = inject(HttpClient);

  private readonly webhookUrl = '/api/proxy-google-script';

  visitorCount = signal<number | null>(null);

  fetchAndIncrementCount(): void {
    this.http.get<{ count: number }>(`${this.webhookUrl}?action=getVisitorCount`)
      .pipe(
        catchError(error => {
          console.error('Failed to fetch visitor count', error);
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        if (response && typeof response.count === 'number') {
          this.visitorCount.set(response.count);
        }
      });
  }
}
