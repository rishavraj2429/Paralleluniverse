import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { orchestrator } from '@/bot-engine/BotOrchestrator';

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();
    const meeting = store.getMeetingById(meetingId);
    
    if (!meeting) {
      return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    }

    orchestrator.dispatchBot(meetingId).catch(err => {
      console.error('Manual dispatch error:', err);
    });

    return NextResponse.json({ success: true, message: `Bot dispatched for ${meeting.title}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
