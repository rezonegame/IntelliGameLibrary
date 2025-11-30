import { Injectable, inject } from '@angular/core';
import { FeedbackService } from '../../features/feedback/services/feedback.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private feedbackService = inject(FeedbackService);

  logEvent(eventType: string, eventData: string) {
    // We send analytics events in a fire-and-forget manner.
    this.feedbackService.logAnalyticsEvent(eventType, eventData).subscribe({
      error: (err) => {
        console.error(`Analytics event logging failed: ${eventType}`, err);
      }
    });
  }
}
