import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Meeting, ActionItem } from '@/types/meeting';

interface EnterpriseMeetingState {
  meetings: Meeting[];
  selectedMeetingId: string | null;
  ragQueryResult: {
    answer: string;
    citations: Array<{ speaker: string; timestamp: string; snippet: string }>;
  } | null;
  jiraSyncStatus: 'idle' | 'syncing' | 'synced' | 'failed';
  loading: boolean;
  error: string | null;
}

const initialState: EnterpriseMeetingState = {
  meetings: [],
  selectedMeetingId: null,
  ragQueryResult: null,
  jiraSyncStatus: 'idle',
  loading: false,
  error: null,
};

// Async thunk to query the Python LangGraph RAG microservice
export const queryRAGContext = createAsyncThunk(
  'meetings/queryRAGContext',
  async ({ meetingId, query }: { meetingId: string; query: string }) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, message: query }),
    });
    const data = await response.json();
    return data;
  }
);

// Async thunk to sync action items to JIRA via Agile / Scrum backlog
export const syncActionItemsToJira = createAsyncThunk(
  'meetings/syncActionItemsToJira',
  async ({ meetingId, actionItems }: { meetingId: string; actionItems: ActionItem[] }) => {
    // In production, posts to JIRA REST API endpoint
    console.log(`[JIRA Sync] Syncing ${actionItems.length} items to JIRA project backlog for meeting ${meetingId}`);
    return { success: true, count: actionItems.length };
  }
);

export const meetingSlice = createSlice({
  name: 'enterpriseMeetings',
  initialState,
  reducers: {
    selectMeeting: (state, action: PayloadAction<string>) => {
      state.selectedMeetingId = action.payload;
    },
    toggleActionItemStatus: (state, action: PayloadAction<{ meetingId: string; itemId: string }>) => {
      const meeting = state.meetings.find((m) => m.id === action.payload.meetingId);
      if (meeting && meeting.summary?.actionItems) {
        const item = meeting.summary.actionItems.find((it) => it.id === action.payload.itemId);
        if (item) item.completed = !item.completed;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryRAGContext.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryRAGContext.fulfilled, (state, action) => {
        state.loading = false;
        state.ragQueryResult = {
          answer: action.payload.reply || '',
          citations: action.payload.citations || [],
        };
      })
      .addCase(syncActionItemsToJira.pending, (state) => {
        state.jiraSyncStatus = 'syncing';
      })
      .addCase(syncActionItemsToJira.fulfilled, (state) => {
        state.jiraSyncStatus = 'synced';
      });
  },
});

export const { selectMeeting, toggleActionItemStatus } = meetingSlice.actions;
export default meetingSlice.reducer;
