import React from 'react';
import { MeetingPlatform } from '@/types/meeting';
import { Video, MessageSquare, Monitor } from 'lucide-react';

export function PlatformBadge({ platform }: { platform: MeetingPlatform }) {
  switch (platform) {
    case 'zoom':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Video className="w-3.5 h-3.5" />
          Zoom Web
        </span>
      );
    case 'google_meet':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Video className="w-3.5 h-3.5" />
          Google Meet
        </span>
      );
    case 'ms_teams':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <MessageSquare className="w-3.5 h-3.5" />
          MS Teams
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
          <Monitor className="w-3.5 h-3.5" />
          Web Meeting
        </span>
      );
  }
}
