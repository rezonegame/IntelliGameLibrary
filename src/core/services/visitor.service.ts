import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  visitorCount = signal<number | null>(null);

  constructor() {
    // Visitor count functionality has been removed per user request.
  }
}
