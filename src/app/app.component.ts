import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBrowserComponent } from '../features/game-library/components/game-browser/game-browser.component';
import { AiIdentifierComponent } from '../features/ai-tools/components/ai-identifier/ai-identifier.component';
import { InspirationWorkshopComponent } from '../features/ai-tools/components/inspiration-workshop/inspiration-workshop.component';
import { ApiKeyModalComponent } from '../core/ui/api-key-modal/api-key-modal.component';
import { ToastContainerComponent } from '../core/ui/toast/toast.component';
import { SidebarComponent } from './sidebar.component';

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
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  currentView = signal<AppView>('browser');
  isApiKeyModalOpen = signal(false);
  isMobileMenuOpen = signal(false);

  setView(view: AppView) {
    this.currentView.set(view);
    this.isMobileMenuOpen.set(false);
  }

  openApiKeyModal() {
    this.isApiKeyModalOpen.set(true);
    this.isMobileMenuOpen.set(false);
  }

  closeApiKeyModal() {
    this.isApiKeyModalOpen.set(false);
  }
}
