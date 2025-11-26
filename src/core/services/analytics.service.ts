import { Injectable, inject } from '@angular/core';
import { FeedbackService } from '../../features/feedback/services/feedback.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private feedbackService = inject(FeedbackService);

  logEvent(eventType: string, eventData: string) {
    // We send analytics events in a fire-and-forget manner.
    // We don't need to handle success or failure here as it's a background task.
    this.feedbackService.logAnalyticsEvent(eventType, eventData).subscribe({
      error: (err) => {
        console.error(`Analytics event logging failed: ${eventType}`, err);
      }
    });
  }
}
