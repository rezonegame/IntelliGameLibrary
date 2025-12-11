import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../core/ai/ai.service';
import { UiService } from '../core/services/ui.service';
import { VisitorService } from '../core/services/visitor.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="bg-white p-6 flex flex-col justify-between shadow-sm border-r border-slate-200 h-full">
      <div>
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <svg class="w-10 h-10 text-cyan-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <h1 class="text-2xl font-bold text-cyan-700 ml-2">智游图鉴</h1>
          </div>
          <button (click)="closeMenu.emit()" class="md:hidden text-slate-500 hover:text-slate-800 text-3xl p-1 -mr-2">
            &times;
          </button>
        </div>

        <nav class="space-y-3">
          <button (click)="uiService.setView('browser'); closeMenu.emit()" 
                  [class]="'w-full flex items-center px-4 py-2.5 rounded-lg transition-colors text-base font-medium ' + (uiService.currentView() === 'browser' ? 'bg-cyan-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 1v-1H5V5z" /></svg>
            游戏典藏
          </button>
          <button (click)="uiService.setView('identifier'); closeMenu.emit()" 
                  [class]="'w-full flex items-center px-4 py-2.5 rounded-lg transition-colors text-base font-medium ' + (uiService.currentView() === 'identifier' ? 'bg-cyan-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            AI 识别器
          </button>
          <button (click)="uiService.setView('workshop'); closeMenu.emit()" 
                  [class]="'w-full flex items-center px-4 py-2.5 rounded-lg transition-colors text-base font-medium ' + (uiService.currentView() === 'workshop' ? 'bg-cyan-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM4 17a1 1 0 001.447.894l4-2A1 1 0 0010 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 004 7v10z" /></svg>
            灵感工坊
          </button>
        </nav>
      </div>
      
      <div class="border-t border-slate-200 pt-5 space-y-3">
          <div class="px-2 text-sm text-slate-500 space-y-1">
              <p>AI 服务: 
                  <span class="font-semibold" [class]="aiService.isConfigured() ? 'text-emerald-500' : 'text-amber-500'">
                    {{ aiService.getProviderName(aiService.activeProviderType()) }}
                    {{ aiService.isConfigured() ? '(已激活)' : '(未配置)' }}
                  </span>
              </p>
              <p>访客总数: 
                <span class="font-semibold text-slate-600">
                  {{ visitorService.visitorCount() ?? '加载中...' }}
                </span>
              </p>
          </div>
          <button (click)="uiService.openApiKeyModal(); closeMenu.emit()" class="w-full text-sm text-center text-cyan-600 hover:text-cyan-700 transition-colors font-medium">
              配置 AI 服务
          </button>
          <div class="text-center text-xs text-slate-400 pt-2">
              <p class="mb-1">由 <span style="font-weight:bolder;">来福的鱼塘</span> 驱动</p>
              <p>（欢迎加我的公众号聊天）</p>
          </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  aiService = inject(AiService);
  uiService = inject(UiService);
  visitorService = inject(VisitorService);
  closeMenu = output();
}