import { Injectable, signal } from '@angular/core';
import { Game } from '../models/game.model';

export type AppView = 'browser' | 'identifier' | 'workshop';
export type InspirationType = 'remodel' | 'simulate';

export interface InspirationContext {
  game: Game;
  type: InspirationType;
  suggestion?: string;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  // View management
  currentView = signal<AppView>('browser');

  // Modal management
  isApiKeyModalOpen = signal(false);
  
  // Cross-component communication
  inspirationContext = signal<InspirationContext | null>(null);

  setView(view: AppView) {
    // When switching view, clear inspiration context
    if (this.currentView() !== view) {
      this.inspirationContext.set(null);
    }
    this.currentView.set(view);
  }

  openApiKeyModal() {
    this.isApiKeyModalOpen.set(true);
  }

  closeApiKeyModal() {
    this.isApiKeyModalOpen.set(false);
  }

  requestInspiration(game: Game, type: InspirationType, suggestion?: string) {
    this.inspirationContext.set({ game, type, suggestion });
    this.currentView.set('workshop');
  }
}
