import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const personas = store.getPersonas();
  return NextResponse.json({ success: true, personas });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, avatarUrl, videoFeedUrl, audioFeedUrl, muteOnJoin, hideVideoOnJoin } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Persona name is required' }, { status: 400 });
    }

    const persona = store.addPersona({
      name,
      email,
      avatarUrl,
      videoFeedUrl,
      audioFeedUrl,
      muteOnJoin: !!muteOnJoin,
      hideVideoOnJoin: !!hideVideoOnJoin,
    });

    return NextResponse.json({ success: true, persona });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
