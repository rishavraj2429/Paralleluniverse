export type MeetingPlatform = 'zoom' | 'google_meet' | 'ms_teams' | 'unknown';

export type BotStatus =
  | 'scheduled'
  | 'queued'
  | 'joining'
  | 'in_meeting'
  | 'recording'
  | 'processing'
  | 'completed'
  | 'failed';

export interface BotPersona {
  id: string;
  name: string; // e.g. "Peter Solimine (AI Assistant)"
  email?: string;
  avatarUrl?: string;
  videoFeedUrl?: string; // Path/URL to MP4 video stream to loop as fake webcam
  audioFeedUrl?: string; // Path/URL to audio file to play in mic
  muteOnJoin: boolean;
  hideVideoOnJoin: boolean;
}

export interface TranscriptUtterance {
  id: string;
  speaker: string;
  timestamp: string; // ISO or offset e.g. "02:15"
  text: string;
  confidence?: number;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface MeetingSummary {
  executiveSummary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  topics: {
    title: string;
    description: string;
    timeOffset: string;
  }[];
  sentiment: 'positive' | 'neutral' | 'constructive';
}

export interface Meeting {
  id: string;
  title: string;
  meetingUrl: string;
  platform: MeetingPlatform;
  passcode?: string;
  scheduledTime: string; // ISO Date String
  durationMinutes?: number;
  status: BotStatus;
  personaId: string;
  personaName: string;
  recordingUrl?: string;
  transcript?: TranscriptUtterance[];
  summary?: MeetingSummary;
  logs: string[]; // Bot status logs (e.g. "Joined waiting room", "Admitted", "Recording started")
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDTO {
  title: string;
  meetingUrl: string;
  passcode?: string;
  scheduledTime?: string;
  personaId?: string;
  videoFeedUrl?: string;
  audioFeedUrl?: string;
}
