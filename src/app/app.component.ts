import { Component, ChangeDetectionStrategy, signal, inject, OnInit, afterNextRender } from '@angular/core';
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
import { UiService } from '../core/services/ui.service';

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
  template: `
<div class="relative min-h-screen bg-slate-50 text-slate-800 md:flex">
  <!-- Mobile Header -->
  <header class="bg-white md:hidden border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
    <div class="flex items-center">
      <svg class="w-8 h-8 text-cyan-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      <h1 class="text-xl font-bold text-cyan-700 ml-2">智游图鉴</h1>
    </div>
    <button (click)="isMobileMenuOpen.set(true)" class="p-2 text-slate-600 hover:text-slate-900">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
    </button>
  </header>

  <!-- Sidebar -->
  <div [class]="'fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 ' + (isMobileMenuOpen() ? 'translate-x-0' : '-translate-x-full')">
    <app-sidebar 
      class="w-full h-full"
      (closeMenu)="isMobileMenuOpen.set(false)">
    </app-sidebar>
  </div>
  
  <!-- Overlay for mobile -->
  @if(isMobileMenuOpen()) {
    <div (click)="isMobileMenuOpen.set(false)" class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>
  }

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto">
    @switch (uiService.currentView()) {
      @case ('browser') { <app-game-browser></app-game-browser> }
      @case ('identifier') { <app-ai-identifier></app-ai-identifier> }
      @case ('workshop') { <app-inspiration-workshop></app-inspiration-workshop> }
    }
  </main>
</div>

<!-- FABs Container -->
<div class="fixed bottom-6 right-6 z-40" (mouseenter)="isFabMenuOpen.set(true)" (mouseleave)="isFabMenuOpen.set(false)">
  <div class="relative flex flex-col items-center space-y-3">
    <!-- Feedback FAB (Secondary) -->
    <button (click)="openFeedbackModal()"
            title="留言反馈"
            [class]="'bg-white border border-slate-200 text-slate-500 p-3 rounded-full shadow-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ease-in-out ' + (isFabMenuOpen() ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428a1 1 0 00.475 0l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    </button>
    
    <!-- Help & Updates FAB (Primary) -->
    <button (click)="isHelpVisible.set(true)"
            title="帮助与更新"
            class="bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-110 z-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </div>
</div>


<!-- Help Panel -->
@if (isHelpVisible()) {
  <div class="fixed bottom-24 right-6 w-full max-w-xs sm:max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-fade-in-up text-sm">
    <div class="p-4 border-b border-slate-200 flex justify-between items-center">
      <h3 class="font-bold text-base text-cyan-700">使用说明 & 更新日志</h3>
      <button (click)="isHelpVisible.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors text-2xl font-light p-1 -m-1">&times;</button>
    </div>
    <div class="p-4 max-h-64 overflow-y-auto text-slate-600 space-y-4">
      <div>
        <h4 class="font-semibold text-slate-800 mb-2">快速上手</h4>
        <ul class="list-disc list-inside space-y-1.5 pl-1">
          <li><b>浏览典藏：</b>探索和筛选公共版权游戏。</li>
          <li><b>AI 识别：</b>描述一款游戏，让 AI 帮你识别。</li>
          <li><b>激发灵感：</b>在工坊中融合机制、改造主题。</li>
          <li><b>配置服务：</b>点击侧边栏“配置 AI 服务”以启用 AI 功能。</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-slate-800 mb-2">更新日志</h4>
        <ul class="list-disc list-inside space-y-1.5 pl-1">
          <li><b>v2.4:</b> AI 服务智能切换优化，提升启动体验。</li>
          <li><b>v2.3:</b> 全面 UI/UX 体验升级（今日聚焦、情境化AI工具等）。</li>
          <li><b>v2.2:</b> 新增5款经典公共版权卡牌游戏。</li>
          <li><b>v2.1.1:</b> 新增每日tips，告诉你桌游背后的故事。</li>
          <li><b>v2.1:</b> 新增赌场、惠斯特、争上游三款游戏。</li>
          <li><b>v2.0:</b> 升级为全局搜索，可检索所有游戏文本。</li>
          <li><b>v1.5:</b> 引入多 AI 服务商支持 (Gemini, OpenAI 等)。</li>
          <li><b>v1.0:</b> 应用发布。</li>
        </ul>
      </div>
    </div>
  </div>
}

@if (uiService.isApiKeyModalOpen()) {
  <app-api-key-modal (close)="uiService.closeApiKeyModal()"></app-api-key-modal>
}
@if (isFeedbackModalOpen()) {
  <app-message-board-modal (close)="closeFeedbackModal()"></app-message-board-modal>
}
@if (isTipModalOpen() && tipGame()) {
  <app-tip-modal 
    [game]="tipGame()!" 
    (close)="closeTipModal()" 
    (viewDetails)="viewTipGameDetails()">
  </app-tip-modal>
}
<app-toast-container></app-toast-container>
  `,
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
  uiService = inject(UiService);
  private analyticsService = inject(AnalyticsService);
  private gameService = inject(GameService);

  isMobileMenuOpen = signal(false);
  isFeedbackModalOpen = signal(false);
  isHelpVisible = signal(false);
  isFabMenuOpen = signal(false);

  // Signals for the new Tip Modal
  tipGame = signal<Game | null>(null);
  isTipModalOpen = signal(false);

  constructor() {
    this.analyticsService.logEvent('pageView', this.uiService.currentView()); // Log initial view
  }

  ngOnInit() {
    const sharedGameHandled = this.handleSharedGameLink();
    if (!sharedGameHandled) {
      this.showRandomTip();
    }
  }

  private handleSharedGameLink(): boolean {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#game=')) {
      const gameId = hash.substring('#game='.length);
      if (gameId) {
        const game = this.gameService.games().find(g => g.id === +gameId);
        if (game) {
          this.uiService.setView('browser');
          afterNextRender(() => {
            this.gameService.openGameDetails.set(game);
          });
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          return true;
        }
      }
    }
    return false;
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
      this.uiService.setView('browser');
      this.gameService.openGameDetails.set(game);
    }
    this.isTipModalOpen.set(false);
  }

  openFeedbackModal() {
    this.isFeedbackModalOpen.set(true);
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen.set(false);
  }
}
