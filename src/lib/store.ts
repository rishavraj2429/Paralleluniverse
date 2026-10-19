import fs from 'fs';
import path from 'path';
import { Meeting, BotPersona, CreateMeetingDTO, MeetingPlatform } from '@/types/meeting';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DBData {
  meetings: Meeting[];
  personas: BotPersona[];
}

function detectPlatform(url: string): MeetingPlatform {
  const lowercase = url.toLowerCase();
  if (lowercase.includes('zoom.us') || lowercase.includes('zoom.com')) return 'zoom';
  if (lowercase.includes('meet.google.com')) return 'google_meet';
  if (lowercase.includes('teams.microsoft.com') || lowercase.includes('teams.live.com')) return 'ms_teams';
  return 'unknown';
}

const DEFAULT_PERSONAS: BotPersona[] = [
  {
    id: 'default-persona-1',
    name: 'Eulr Cloud Bot (Peter Solimine)',
    email: 'peter@eulr.ai',
    muteOnJoin: false,
    hideVideoOnJoin: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    videoFeedUrl: 'sample-loop.mp4',
  },
  {
    id: 'default-persona-2',
    name: 'Executive Scribe Bot',
    email: 'scribe@eulr.ai',
    muteOnJoin: true,
    hideVideoOnJoin: true,
  }
];

export class DBStore {
  private data: DBData = {
    meetings: [],
    personas: DEFAULT_PERSONAS,
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        // Seed with sample initial meeting
        this.seedSampleData();
        this.save();
      }
    } catch (err) {
      console.error('Failed to load DB, using in-memory default:', err);
    }
  }

  private seedSampleData() {
    const now = new Date();
    this.data.meetings = [
      {
        id: 'sample-meeting-1',
        title: 'Shark Tank Pitch & Strategy Sync',
        meetingUrl: 'https://zoom.us/j/9876543210',
        platform: 'zoom',
        passcode: '123456',
        scheduledTime: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        durationMinutes: 25,
        status: 'completed',
        personaId: 'default-persona-1',
        personaName: 'Eulr Cloud Bot (Peter Solimine)',
        logs: [
          '00:00 - Dispatched Playwright bot engine',
          '00:02 - Navigated to Zoom Web Client',
          '00:05 - Joined meeting as "Eulr Cloud Bot (Peter Solimine)"',
          '00:06 - Media recorder started',
          '00:25 - Host ended meeting. Saved raw audio recording.',
          '00:26 - AI Transcription & Summarization pipeline finished.'
        ],
        transcript: [
          { id: '1', speaker: 'Peter Solimine (Bot)', timestamp: '00:05', text: 'Hello everyone! I am Peter\'s Eulr bot joining to record and take notes today.' },
          { id: '2', speaker: 'Investor Mark', timestamp: '00:15', text: 'Welcome Peter! Tell us how Eulr manages cloud video playback and automated attendance.' },
          { id: '3', speaker: 'Peter Solimine (Bot)', timestamp: '00:30', text: 'Eulr runs isolated Chromium containers on cloud workers, injecting synthetic audio/video pipes directly into WebRTC.' },
          { id: '4', speaker: 'Investor Lori', timestamp: '01:10', text: 'That is impressive! Let\'s follow up on the partnership roadmap next Tuesday.' }
        ],
        summary: {
          executiveSummary: 'Discussion centered around Eulr\'s cloud architecture for WebRTC virtual attendance and upcoming investor strategy.',
          keyDecisions: [
            'Deploy isolated Docker workers for low-latency browser streaming',
            'Integrate live Whisper transcript stream with action item detection'
          ],
          actionItems: [
            { id: 'act-1', task: 'Send partnership proposal draft to Lori', assignee: 'Peter Solimine', priority: 'high', completed: false },
            { id: 'act-2', task: 'Bench-test Google Meet waiting room auto-bypass', assignee: 'Engineering Team', priority: 'medium', completed: true }
          ],
          topics: [
            { title: 'Intro & Bot Capabilities', description: 'Eulr bot greeted participants and demonstrated real-time stream injection.', timeOffset: '00:05' },
            { title: 'Technical Deep Dive', description: 'Explanation of headless browser WebRTC pipelines and Zoom Web client auto-join.', timeOffset: '00:30' }
          ],
          sentiment: 'positive'
        },
        createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      }
    ];
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save DB:', err);
    }
  }

  public getMeetings(): Meeting[] {
    return this.data.meetings;
  }

  public getMeetingById(id: string): Meeting | undefined {
    return this.data.meetings.find((m) => m.id === id);
  }

  public createMeeting(dto: CreateMeetingDTO): Meeting {
    const platform = detectPlatform(dto.meetingUrl);
    const persona = this.data.personas.find(p => p.id === dto.personaId) || this.data.personas[0];
    
    const newMeeting: Meeting = {
      id: uuidv4(),
      title: dto.title || 'Automated Meeting Bot Session',
      meetingUrl: dto.meetingUrl,
      platform,
      passcode: dto.passcode,
      scheduledTime: dto.scheduledTime || new Date().toISOString(),
      status: dto.scheduledTime && new Date(dto.scheduledTime) > new Date() ? 'scheduled' : 'queued',
      personaId: persona.id,
      personaName: persona.name,
      logs: [`Meeting scheduled for ${dto.scheduledTime || 'immediate launch'}`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.meetings.unshift(newMeeting);
    this.save();
    return newMeeting;
  }

  public updateMeetingStatus(id: string, status: Meeting['status'], logMessage?: string): Meeting | undefined {
    const meeting = this.getMeetingById(id);
    if (!meeting) return undefined;

    meeting.status = status;
    meeting.updatedAt = new Date().toISOString();
    if (logMessage) {
      const timestamp = new Date().toLocaleTimeString();
      meeting.logs.push(`[${timestamp}] ${logMessage}`);
    }
    this.save();
    return meeting;
  }

  public setMeetingResults(id: string, transcript: Meeting['transcript'], summary: Meeting['summary'], recordingUrl?: string) {
    const meeting = this.getMeetingById(id);
    if (!meeting) return;

    if (transcript) meeting.transcript = transcript;
    if (summary) meeting.summary = summary;
    if (recordingUrl) meeting.recordingUrl = recordingUrl;
    meeting.status = 'completed';
    meeting.updatedAt = new Date().toISOString();
    meeting.logs.push(`[${new Date().toLocaleTimeString()}] AI processing complete. Status set to completed.`);
    this.save();
  }

  public getPersonas(): BotPersona[] {
    return this.data.personas;
  }

  public addPersona(persona: Omit<BotPersona, 'id'>): BotPersona {
    const newPersona: BotPersona = {
      ...persona,
      id: uuidv4(),
    };
    this.data.personas.push(newPersona);
    this.save();
    return newPersona;
  }
}

export const store = new DBStore();
