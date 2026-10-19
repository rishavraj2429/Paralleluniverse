import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { orchestrator } from '@/bot-engine/BotOrchestrator';
import { MeetingScheduler } from '@/scheduler/scheduler';

// Start scheduler at runtime (not during build phase)
if (process.env.NEXT_PHASE !== 'phase-production-build' && typeof window === 'undefined') {
  MeetingScheduler.startScheduler();
}

export async function GET() {
  const meetings = store.getMeetings();
  return NextResponse.json({ success: true, meetings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, meetingUrl, passcode, scheduledTime, personaId, instantLaunch } = body;

    if (!meetingUrl) {
      return NextResponse.json({ success: false, error: 'Meeting URL is required' }, { status: 400 });
    }

    const meeting = store.createMeeting({
      title,
      meetingUrl,
      passcode,
      scheduledTime,
      personaId,
    });

    if (instantLaunch || !scheduledTime || new Date(scheduledTime) <= new Date()) {
      // Dispatch asynchronously
      orchestrator.dispatchBot(meeting.id).catch(err => {
        console.error('Instant dispatch error:', err);
      });
    }

    return NextResponse.json({ success: true, meeting });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
