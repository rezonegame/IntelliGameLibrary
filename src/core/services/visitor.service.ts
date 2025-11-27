import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Re-use the same webhook URL from FeedbackService
  private readonly webhookUrl = 'https://script.google.com/macros/s/AKfycbwghD1EpYuGmAHFty2gDHKGXJ0H4AEQ85KKB2EqO69SJEdh980yqqbVToZK4nItRwRV/exec';

  visitorCount = signal<number | null>(null);

  fetchAndIncrementCount(): void {
    this.http.get<{ count: number }>(`${this.webhookUrl}?action=getVisitorCount`)
      .pipe(
        catchError(error => {
          console.error('Failed to fetch visitor count', error);
          // Don't show a toast for this, to keep the UI clean
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
