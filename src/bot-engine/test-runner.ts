import { GoogleMeetBot } from './GoogleMeetBot';
import { ZoomWebBot } from './ZoomWebBot';
import { MSTeamsBot } from './MSTeamsBot';
import { store } from '../lib/store';

async function main() {
  const args = process.argv.slice(2);
  const meetingUrl = args[0] || 'https://meet.google.com/abc-defg-hij';
  const personaName = args[1] || 'Eulr Cloud Persona (Peter Solimine)';

  console.log(`====================================================`);
  console.log(`  Eulr Virtual Persona Meeting Bot Runner`);
  console.log(`  Target URL: ${meetingUrl}`);
  console.log(`  Bot Persona: ${personaName}`);
  console.log(`====================================================`);

  const personas = store.getPersonas();
  const persona = personas[0] || {
    name: personaName,
    muteOnJoin: false,
    hideVideoOnJoin: false,
  };

  const isGoogleMeet = meetingUrl.includes('meet.google.com');
  const isZoom = meetingUrl.includes('zoom.us') || meetingUrl.includes('zoom.com');
  const isTeams = meetingUrl.includes('teams.microsoft.com') || meetingUrl.includes('teams.live.com');

  const options = {
    botName: personaName,
    meetingUrl,
    muteOnJoin: persona.muteOnJoin,
    hideVideoOnJoin: persona.hideVideoOnJoin,
    videoFilePath: persona.videoFeedUrl,
    audioFilePath: persona.audioFeedUrl,
    headless: false, // Set to false when running test runner locally so user can observe Chromium joining!
  };

  const onLog = (msg: string) => {
    console.log(`[LOG ${new Date().toLocaleTimeString()}] ${msg}`);
  };

  if (isGoogleMeet) {
    console.log('Detected Google Meet link. Launching GoogleMeetBot with Virtual Persona...');
    const bot = new GoogleMeetBot();
    await bot.join(options, onLog);
  } else if (isZoom) {
    console.log('Detected Zoom link. Launching ZoomWebBot with Virtual Persona...');
    const bot = new ZoomWebBot();
    await bot.join(options, onLog);
  } else if (isTeams) {
    console.log('Detected MS Teams link. Launching MSTeamsBot with Virtual Persona...');
    const bot = new MSTeamsBot();
    await bot.join(options, onLog);
  } else {
    console.error('Unrecognized meeting URL. Please provide a valid Google Meet, Zoom, or MS Teams link.');
  }
}

main().catch(console.error);
