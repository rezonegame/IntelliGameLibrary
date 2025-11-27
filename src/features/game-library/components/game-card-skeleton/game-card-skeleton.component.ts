import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-game-card-skeleton',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl shadow-md border border-slate-200 p-5 animate-pulse">
      <div class="h-44 bg-slate-200 rounded-lg"></div>
      <div class="mt-5 space-y-3">
        <div class="h-6 bg-slate-200 rounded w-3/4"></div>
        <div class="h-4 bg-slate-200 rounded w-full"></div>
        <div class="h-4 bg-slate-200 rounded w-5/6"></div>
        <div class="flex space-x-2 pt-2">
          <div class="h-6 w-20 bg-slate-200 rounded-full"></div>
          <div class="h-6 w-24 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCardSkeletonComponent {}
