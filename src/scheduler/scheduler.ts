import cron from 'node-cron';
import { store } from '@/lib/store';
import { orchestrator } from '@/bot-engine/BotOrchestrator';

export class MeetingScheduler {
  private static isRunning = false;

  public static startScheduler() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[MeetingScheduler] Started Eulr background meeting scheduler...');

    // Run every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        const meetings = store.getMeetings();
        const now = new Date();

        for (const meeting of meetings) {
          if (meeting.status === 'scheduled') {
            const scheduledTime = new Date(meeting.scheduledTime);
            // Launch if scheduled time is within 1 minute or passed
            const diffSeconds = (scheduledTime.getTime() - now.getTime()) / 1000;

            if (diffSeconds <= 60) {
              console.log(`[MeetingScheduler] Scheduled time reached for "${meeting.title}" (${meeting.id}). Dispatching bot!`);
              store.updateMeetingStatus(meeting.id, 'queued', 'Scheduler triggered bot launch');
              orchestrator.dispatchBot(meeting.id).catch(err => {
                console.error(`Scheduler dispatch error:`, err);
              });
            }
          }
        }
      } catch (err) {
        console.error('[MeetingScheduler] Cron tick error:', err);
      }
    });
  }
}
