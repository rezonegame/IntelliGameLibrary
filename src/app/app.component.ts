import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBrowserComponent } from '../features/game-library/components/game-browser/game-browser.component';
import { AiIdentifierComponent } from '../features/ai-tools/components/ai-identifier/ai-identifier.component';
import { InspirationWorkshopComponent } from '../features/ai-tools/components/inspiration-workshop/inspiration-workshop.component';
import { ApiKeyModalComponent } from '../core/ui/api-key-modal/api-key-modal.component';
import { ToastContainerComponent } from '../core/ui/toast/toast.component';
import { SidebarComponent } from './sidebar.component';
import { MessageBoardModalComponent } from '../features/feedback/components/message-board-modal.component';
import { AnalyticsService } from '../core/services/analytics.service';
import { GameService } from '../features/game-library/services/game.service';
import { Game } from '../core/models/game.model';
import { TipModalComponent } from '../core/ui/tip-modal/tip-modal.component';

export type AppView = 'browser' | 'identifier' | 'workshop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    GameBrowserComponent,
    AiIdentifierComponent,
    InspirationWorkshopComponent,
    ApiKeyModalComponent,
    ToastContainerComponent,
    MessageBoardModalComponent,
    TipModalComponent,
  ],
  templateUrl: './app.component.html',
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.2s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private gameService = inject(GameService);

  currentView = signal<AppView>('browser');
  isApiKeyModalOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isFeedbackModalOpen = signal(false);
  isHelpVisible = signal(false);
  isFabMenuOpen = signal(false);

  // Signals for the new Tip Modal
  tipGame = signal<Game | null>(null);
  isTipModalOpen = signal(false);

  constructor() {
    this.analyticsService.logEvent('pageView', 'browser'); // Log initial view
  }

  ngOnInit() {
    this.showRandomTip();
  }

  showRandomTip() {
    const today = new Date().toISOString().split('T')[0];
    const lastTipShownDate = localStorage.getItem('lastTipShownDate');

    if (today !== lastTipShownDate) {
      const gamesWithStories = this.gameService.games().filter(g => g.historicalStory);
      if (gamesWithStories.length > 0) {
        const randomIndex = Math.floor(Math.random() * gamesWithStories.length);
        this.tipGame.set(gamesWithStories[randomIndex]);
        this.isTipModalOpen.set(true);
        localStorage.setItem('lastTipShownDate', today);
      }
    }
  }

  closeTipModal() {
    this.isTipModalOpen.set(false);
  }

  viewTipGameDetails() {
    const game = this.tipGame();
    if (game) {
      this.currentView.set('browser'); // Ensure we are on the browser view
      // This will be handled by the game browser component now, which opens the detail modal
      // FIX: 'openGameDetails' is a signal and should be updated using .set()
      this.gameService.openGameDetails.set(game);
    }
    this.isTipModalOpen.set(false);
  }

  setView(view: AppView) {
    if (this.currentView() !== view) {
      this.currentView.set(view);
      this.analyticsService.logEvent('pageView', view);
    }
    this.isMobileMenuOpen.set(false);
  }

  openApiKeyModal() {
    this.isApiKeyModalOpen.set(true);
    this.isMobileMenuOpen.set(false);
  }

  closeApiKeyModal() {
    this.isApiKeyModalOpen.set(false);
  }

  openFeedbackModal() {
    this.isFeedbackModalOpen.set(true);
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen.set(false);
  }
}