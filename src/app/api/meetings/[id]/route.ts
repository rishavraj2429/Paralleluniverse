import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const meeting = store.getMeetingById(params.id);
  if (!meeting) {
    return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, meeting });
}
