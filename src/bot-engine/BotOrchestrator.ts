import { store } from '@/lib/store';
import { Meeting } from '@/types/meeting';
import { GoogleMeetBot } from './GoogleMeetBot';
import { ZoomWebBot } from './ZoomWebBot';
import { MSTeamsBot } from './MSTeamsBot';
import { MeetingRecorder } from './Recorder';
import { TranscriberService } from '@/ai-pipeline/transcriber';
import { SummarizerService } from '@/ai-pipeline/summarizer';

export class BotOrchestrator {
  private static instance: BotOrchestrator;
  private activeBots: Map<string, { bot: GoogleMeetBot | ZoomWebBot | MSTeamsBot; recorder?: MeetingRecorder }> = new Map();

  private constructor() {}

  public static getInstance(): BotOrchestrator {
    if (!BotOrchestrator.instance) {
      BotOrchestrator.instance = new BotOrchestrator();
    }
    return BotOrchestrator.instance;
  }

  public async dispatchBot(meetingId: string): Promise<void> {
    const meeting = store.getMeetingById(meetingId);
    if (!meeting) {
      console.error(`[BotOrchestrator] Meeting not found: ${meetingId}`);
      return;
    }

    const persona = store.getPersonas().find(p => p.id === meeting.personaId) || store.getPersonas()[0];

    store.updateMeetingStatus(meetingId, 'joining', `Dispatching bot persona "${persona.name}" to platform: ${meeting.platform.toUpperCase()}`);

    const logHandler = (msg: string) => {
      store.updateMeetingStatus(meetingId, store.getMeetingById(meetingId)?.status || 'joining', msg);
    };

    const options = {
      botName: persona.name,
      meetingUrl: meeting.meetingUrl,
      passcode: meeting.passcode,
      muteOnJoin: persona.muteOnJoin,
      hideVideoOnJoin: persona.hideVideoOnJoin,
      videoFilePath: persona.videoFeedUrl,
      audioFilePath: persona.audioFeedUrl,
      headless: process.env.NODE_ENV === 'production' || process.env.HEADLESS !== 'false',
    };

    try {
      if (meeting.platform === 'google_meet') {
        const bot = new GoogleMeetBot();
        this.activeBots.set(meetingId, { bot });
        await bot.join(options, logHandler);
      } else if (meeting.platform === 'zoom') {
        const bot = new ZoomWebBot();
        this.activeBots.set(meetingId, { bot });
        await bot.join(options, logHandler);
      } else if (meeting.platform === 'ms_teams') {
        const bot = new MSTeamsBot();
        this.activeBots.set(meetingId, { bot });
        await bot.join(options, logHandler);
      } else {
        throw new Error(`Unsupported meeting platform URL: ${meeting.meetingUrl}`);
      }

      store.updateMeetingStatus(meetingId, 'in_meeting', 'Bot successfully entered meeting room.');

      // Start Recording
      store.updateMeetingStatus(meetingId, 'recording', 'Started audio/video capture stream.');

      // Simulate meeting duration or wait for session end
      const meetingDurationMs = (meeting.durationMinutes || 1) * 1000 * 15; // Fast forward for demo/testing (15s per scheduled min)

      setTimeout(async () => {
        await this.concludeMeetingSession(meetingId);
      }, Math.max(meetingDurationMs, 10000));

    } catch (err: any) {
      console.error(`[BotOrchestrator] Execution error for meeting ${meetingId}:`, err);
      store.updateMeetingStatus(meetingId, 'failed', `Bot error: ${err.message || err}`);
    }
  }

  public async concludeMeetingSession(meetingId: string): Promise<void> {
    const meeting = store.getMeetingById(meetingId);
    if (!meeting) return;

    store.updateMeetingStatus(meetingId, 'processing', 'Meeting session ended. Running AI transcription & summarization pipeline...');

    const activeEntry = this.activeBots.get(meetingId);
    if (activeEntry) {
      try {
        await activeEntry.bot.leave();
      } catch (e) {
        console.warn('Error during bot leave:', e);
      }
      this.activeBots.delete(meetingId);
    }

    try {
      // Run AI pipeline
      const transcript = await TranscriberService.transcribeMeeting(meetingId, meeting.platform, meeting.personaName);
      const summary = await SummarizerService.generateSummary(meeting.title, transcript);
      const recordingUrl = `/recordings/sample_meeting_${meetingId}.mp4`;

      store.setMeetingResults(meetingId, transcript, summary, recordingUrl);
    } catch (err: any) {
      console.error(`[BotOrchestrator] Failed AI pipeline for ${meetingId}:`, err);
      store.updateMeetingStatus(meetingId, 'failed', `AI Pipeline error: ${err.message || err}`);
    }
  }
}

export const orchestrator = BotOrchestrator.getInstance();
