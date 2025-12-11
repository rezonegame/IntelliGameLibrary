import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private http = inject(HttpClient);
  visitorCount = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
        this.getVisitorCount();
        this.incrementVisitorCount();
    });
  }

  private getVisitorCount() {
    this.http.get<{ count: number }>('/api/kv-proxy?action=getVisitorCount').pipe(
      tap(response => this.visitorCount.set(response.count)),
      catchError(err => {
        console.error("Failed to fetch visitor count", err);
        return of(null);
      })
    ).subscribe();
  }

  private incrementVisitorCount() {
    const incremented = sessionStorage.getItem('visitor_incremented');
    if (!incremented) {
      this.http.get<{ count: number }>('/api/kv-proxy?action=incrementVisitorCount').pipe(
        tap(response => {
          this.visitorCount.set(response.count);
          sessionStorage.setItem('visitor_incremented', 'true');
        }),
        catchError(err => {
          console.error("Failed to increment visitor count", err);
          return of(null);
        })
      ).subscribe();
    }
  }
}
