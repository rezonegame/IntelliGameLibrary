
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBrowserComponent } from './components/game-browser.component';
import { AiIdentifierComponent } from './components/ai-identifier.component';
import { InspirationWorkshopComponent } from './components/inspiration-workshop.component';
import { ApiKeyModalComponent } from './components/api-key-modal.component';
import { GameCardComponent } from './components/game-card.component';
import { GameDetailModalComponent } from './components/game-detail-modal.component';
import { ToastContainerComponent } from './components/toast.component';
import { LoaderComponent } from './components/loader.component';
import { GeminiService } from './services/gemini.service';

type AppView = 'browser' | 'identifier' | 'workshop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    GameBrowserComponent,
    AiIdentifierComponent,
    InspirationWorkshopComponent,
    ApiKeyModalComponent,
    GameCardComponent,
    GameDetailModalComponent,
    ToastContainerComponent,
    LoaderComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  geminiService = inject(GeminiService);
  currentView = signal<AppView>('browser');

  setView(view: AppView) {
    this.currentView.set(view);
  }

  openApiKeyModal() {
    this.geminiService.isApiKeyModalOpen.set(true);
  }
}
