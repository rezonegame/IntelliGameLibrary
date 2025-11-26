import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBrowserComponent } from '../features/game-library/components/game-browser/game-browser.component';
import { AiIdentifierComponent } from '../features/ai-tools/components/ai-identifier/ai-identifier.component';
import { InspirationWorkshopComponent } from '../features/ai-tools/components/inspiration-workshop/inspiration-workshop.component';
import { ApiKeyModalComponent } from '../core/ui/api-key-modal/api-key-modal.component';
import { ToastContainerComponent } from '../core/ui/toast/toast.component';
import { SidebarComponent } from './sidebar.component';
import { MessageBoardModalComponent } from '../features/feedback/components/message-board-modal.component';
import { AnalyticsService } from '../core/services/analytics.service';

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
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private analyticsService = inject(AnalyticsService);
  currentView = signal<AppView>('browser');
  isApiKeyModalOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isFeedbackModalOpen = signal(false);

  constructor() {
    this.analyticsService.logEvent('pageView', 'browser'); // Log initial view
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