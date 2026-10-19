import { Page, Browser } from 'playwright';
import { MediaStreamInjector, LaunchBotOptions } from './MediaStreamInjector';

export interface GoogleMeetJoinOptions extends LaunchBotOptions {
  meetingUrl: string;
  muteOnJoin?: boolean;
  hideVideoOnJoin?: boolean;
}

export class GoogleMeetBot {
  private page?: Page;
  private browser?: Browser;

  public async join(options: GoogleMeetJoinOptions, onLog?: (msg: string) => void): Promise<void> {
    const log = (msg: string) => {
      console.log(`[GoogleMeetBot] ${msg}`);
      if (onLog) onLog(msg);
    };

    log(`Initializing headless Chromium for Google Meet...`);
    const instance = await MediaStreamInjector.createBotBrowser(options);
    this.browser = instance.browser;
    this.page = instance.page;

    log(`Navigating to Google Meet URL: ${options.meetingUrl}`);
    await this.page.goto(options.meetingUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(4000);

    // Save screenshot for diagnostics
    try {
      await this.page.screenshot({ path: 'public/meet_prejoin.png' });
      log('Captured diagnostic screenshot -> /meet_prejoin.png');
    } catch (e) {
      // Ignore
    }

    // Check if Google requires sign in
    const bodyText = await this.page.evaluate(() => document.body.innerText || '');
    if (bodyText.includes("You can't join this call") || bodyText.includes("Sign in to join")) {
      log('WARNING: Google Meet requires a signed-in Google Account for this specific link.');
    }

    // Turn off mic/cam if configured
    if (options.muteOnJoin) {
      log('Muting microphone via keyboard shortcut (Ctrl+D)...');
      await this.page.keyboard.press('Control+d');
      await this.page.waitForTimeout(500);
    }

    if (options.hideVideoOnJoin) {
      log('Turning off camera via keyboard shortcut (Ctrl+E)...');
      await this.page.keyboard.press('Control+e');
      await this.page.waitForTimeout(500);
    }

    // Fill Display Name input if present
    const nameInputSelectors = [
      'input[placeholder="Your name"]',
      'input[aria-label="Your name"]',
      'input[aria-label="Enter your name"]',
      'input[placeholder*="name"]',
      'input[type="text"]',
    ];

    let nameFilled = false;
    for (const selector of nameInputSelectors) {
      try {
        const input = await this.page.$(selector);
        if (input && await input.isVisible()) {
          log(`Entering virtual persona display name: "${options.botName}"`);
          await input.fill(options.botName);
          await this.page.waitForTimeout(500);
          nameFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!nameFilled) {
      log('Notice: Display name input not visible (browser may already have session state or pre-join layout differs).');
    }

    // Click "Join now" or "Ask to join"
    log('Searching for Google Meet Join button...');
    const joinButtonSelectors = [
      'button:has-text("Ask to join")',
      'button:has-text("Join now")',
      'button:has-text("Join")',
      'span:has-text("Ask to join")',
      'span:has-text("Join now")',
      'div[role="button"]:has-text("Ask to join")',
      'div[role="button"]:has-text("Join now")',
      'button[aria-label*="Ask to join"]',
      'button[aria-label*="Join now"]',
    ];

    let clicked = false;
    for (const selector of joinButtonSelectors) {
      try {
        const btn = await this.page.waitForSelector(selector, { timeout: 4000 });
        if (btn && await btn.isVisible()) {
          log(`Clicking join button: "${selector}"`);
          await btn.click();
          clicked = true;
          break;
        }
      } catch {
        // Try next selector
      }
    }

    if (!clicked) {
      log('Attempting generic Enter key press on pre-join screen...');
      await this.page.keyboard.press('Enter');
    }

    await this.page.waitForTimeout(3000);

    try {
      await this.page.screenshot({ path: 'public/meet_joined.png' });
      log('Captured post-join screenshot -> /meet_joined.png');
    } catch (e) {
      // Ignore
    }

    log(`Virtual persona "${options.botName}" has submitted join request. (Note: Google Meet host must click "Admit" on their screen if waiting room is enabled).`);
  }

  public async leave(): Promise<void> {
    if (this.page) {
      try {
        // Click leave call button if present
        const leaveBtn = await this.page.$('button[aria-label*="Leave call"]');
        if (leaveBtn) await leaveBtn.click();
      } catch (e) {
        console.warn('Could not click leave button directly:', e);
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
