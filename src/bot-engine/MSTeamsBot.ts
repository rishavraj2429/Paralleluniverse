import { Page, Browser } from 'playwright';
import { MediaStreamInjector, LaunchBotOptions } from './MediaStreamInjector';

export interface MSTeamsJoinOptions extends LaunchBotOptions {
  meetingUrl: string;
  muteOnJoin?: boolean;
  hideVideoOnJoin?: boolean;
}

export class MSTeamsBot {
  private page?: Page;
  private browser?: Browser;

  public async join(options: MSTeamsJoinOptions, onLog?: (msg: string) => void): Promise<void> {
    const log = (msg: string) => {
      console.log(`[MSTeamsBot] ${msg}`);
      if (onLog) onLog(msg);
    };

    log(`Launching Playwright for MS Teams...`);
    const instance = await MediaStreamInjector.createBotBrowser(options);
    this.browser = instance.browser;
    this.page = instance.page;

    log(`Navigating to Teams Web URL...`);
    await this.page.goto(options.meetingUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(3000);

    // Bypass "Open Teams Desktop App" prompt if button appears
    log('Bypassing native app prompt...');
    const webContinueSelectors = [
      'button:has-text("Continue on this browser")',
      'button:has-text("Join on the web instead")',
      'a:has-text("Continue on this browser")',
    ];

    for (const selector of webContinueSelectors) {
      try {
        const btn = await this.page.waitForSelector(selector, { timeout: 5000 });
        if (btn) {
          log(`Clicking "${selector}"...`);
          await btn.click();
          break;
        }
      } catch {
        // Next
      }
    }

    await this.page.waitForTimeout(4000);

    // Enter name input
    log(`Entering display name: "${options.botName}"`);
    const nameInputSelectors = [
      'input[data-tid="prejoin-display-name-input"]',
      'input#username',
      'input[placeholder="Type your name"]',
      'input[type="text"]',
    ];

    for (const selector of nameInputSelectors) {
      const input = await this.page.$(selector);
      if (input && await input.isVisible()) {
        await input.fill(options.botName);
        break;
      }
    }

    // Toggle mic and camera if needed
    if (options.muteOnJoin) {
      const micToggle = await this.page.$('toggle-button[data-tid="toggle-mute"], button[data-tid="toggle-mute"]');
      if (micToggle) await micToggle.click();
    }

    if (options.hideVideoOnJoin) {
      const camToggle = await this.page.$('toggle-button[data-tid="toggle-video"], button[data-tid="toggle-video"]');
      if (camToggle) await camToggle.click();
    }

    // Click "Join now" button
    log('Clicking "Join now"...');
    const joinNowBtn = await this.page.waitForSelector('button[data-tid="prejoin-join-button"], button:has-text("Join now")', { timeout: 10000 });
    if (joinNowBtn) {
      await joinNowBtn.click();
    }

    log('MS Teams bot joined meeting lobby/room.');
  }

  public async leave(): Promise<void> {
    if (this.page) {
      try {
        const hangupBtn = await this.page.$('button#hangup-button, button[aria-label*="Hang up"]');
        if (hangupBtn) await hangupBtn.click();
      } catch (e) {
        console.warn('Could not click hangup button:', e);
      }
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  public getPage(): Page | undefined {
    return this.page;
  }
}
