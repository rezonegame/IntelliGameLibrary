
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {}
