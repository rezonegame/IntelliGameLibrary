import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type,
      duration,
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    setTimeout(() => this.remove(newToast.id), duration);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
