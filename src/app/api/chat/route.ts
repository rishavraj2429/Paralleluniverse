import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { orchestrator } from '@/bot-engine/BotOrchestrator';

export async function POST(request: Request) {
  try {
    const { message, meetingId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    const query = message.trim();
    const queryLower = query.toLowerCase();

    // Check if user is asking to dispatch a bot via URL in chat
    const urlMatch = query.match(/https?:\/\/[^\s]+/);
    if (urlMatch && (queryLower.includes('join') || queryLower.includes('send') || queryLower.includes('dispatch'))) {
      const targetUrl = urlMatch[0];
      const newMeeting = store.createMeeting({
        title: 'Chatbot Dispatched Bot Session',
        meetingUrl: targetUrl,
      });

      orchestrator.dispatchBot(newMeeting.id).catch(err => console.error('Chat dispatch error:', err));

      return NextResponse.json({
        success: true,
        reply: `🚀 I've dispatched an autonomous bot to join the meeting at **${targetUrl}** under your default persona! You can monitor live progress on your dashboard.`,
        actionTaken: 'dispatch',
        meetingId: newMeeting.id,
      });
    }

    // Contextual response for specific meeting
    if (meetingId) {
      const meeting = store.getMeetingById(meetingId);
      if (meeting) {
        if (queryLower.includes('action') || queryLower.includes('task') || queryLower.includes('todo')) {
          const items = meeting.summary?.actionItems || [];
          if (items.length === 0) {
            return NextResponse.json({
              success: true,
              reply: `No specific action items were detected for **${meeting.title}** yet.`,
            });
          }
          const itemText = items
            .map((it) => `• **${it.task}** (Owner: ${it.assignee || 'Unassigned'}, Priority: ${it.priority.toUpperCase()})`)
            .join('\n');
          return NextResponse.json({
            success: true,
            reply: `Here are the action items from **${meeting.title}**:\n\n${itemText}`,
          });
        }

        if (queryLower.includes('email') || queryLower.includes('draft') || queryLower.includes('follow-up') || queryLower.includes('follow up')) {
          const summary = meeting.summary?.executiveSummary || 'Discussion on project deliverables and timeline.';
          const decisions = meeting.summary?.keyDecisions.map(d => `• ${d}`).join('\n') || '• Project alignment';

          const draftEmail = `Hi Team,

Thank you for participating in **${meeting.title}**. Here is a brief recap of our discussion:

**Executive Summary:**
${summary}

**Key Decisions:**
${decisions}

Please let me know if you have any questions or additions.

Best regards,
${meeting.personaName}`;

          return NextResponse.json({
            success: true,
            reply: `Here is a drafted follow-up email based on **${meeting.title}**:\n\n\`\`\`text\n${draftEmail}\n\`\`\``,
          });
        }

        if (queryLower.includes('summary') || queryLower.includes('overview') || queryLower.includes('brief')) {
          return NextResponse.json({
            success: true,
            reply: `**Summary for ${meeting.title}:**\n${meeting.summary?.executiveSummary || 'Meeting completed with audio recording captured.'}`,
          });
        }
      }
    }

    // General Eulr Copilot AI response
    let responseText = `I am your **Eulr AI Assistant**. You can ask me to:
• **"Summarize meeting"** or **"Extract action items"** for any session
• **"Draft a follow-up email"** for your team
• **Paste a Zoom, Google Meet, or Teams link** here to dispatch a bot immediately!`;

    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      responseText = `Hello! 👋 How can I assist you with your meeting bots, transcripts, or AI summaries today?`;
    } else if (queryLower.includes('who are you') || queryLower.includes('what can you do')) {
      responseText = `I am **Eulr Copilot** — your AI meeting assistant. I can auto-join Google Meet/Zoom calls, extract action items, generate meeting briefs, and write follow-up emails!`;
    } else if (queryLower.includes('google meet') || queryLower.includes('zoom') || queryLower.includes('teams')) {
      responseText = `To send a bot to a call, just paste the meeting URL here or click **"Dispatch / Schedule Bot"** on the dashboard! I support Google Meet, Zoom Web, and MS Teams.`;
    }

    return NextResponse.json({
      success: true,
      reply: responseText,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
