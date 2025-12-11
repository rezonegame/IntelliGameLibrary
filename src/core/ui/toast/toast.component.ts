import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          [class]="'flex items-center p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform animate-fade-in-up ' + toastColors[toast.type]"
          role="alert">
          <div class="mr-3" [innerHTML]="icons[toast.type]"></div>
          <span class="font-medium">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  
  toastColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-sky-500'
  };

  icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  };
}
