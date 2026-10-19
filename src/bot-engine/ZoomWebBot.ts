import { Page, Browser } from 'playwright';
import { MediaStreamInjector, LaunchBotOptions } from './MediaStreamInjector';

export interface ZoomJoinOptions extends LaunchBotOptions {
  meetingUrl: string;
  passcode?: string;
  muteOnJoin?: boolean;
  hideVideoOnJoin?: boolean;
}

export class ZoomWebBot {
  private page?: Page;
  private browser?: Browser;

  public static transformToWebClientUrl(url: string): string {
    let webUrl = url;
    if (webUrl.includes('/j/')) {
      webUrl = webUrl.replace('/j/', '/wc/join/');
    } else if (webUrl.includes('/my/')) {
      webUrl = webUrl.replace('/my/', '/wc/join/');
    } else if (!webUrl.includes('/wc/join/')) {
      // If it's a raw meeting ID
      const meetingIdMatch = webUrl.match(/\d{9,11}/);
      if (meetingIdMatch) {
        webUrl = `https://zoom.us/wc/join/${meetingIdMatch[0]}`;
      }
    }
    return webUrl;
  }

  public async join(options: ZoomJoinOptions, onLog?: (msg: string) => void): Promise<void> {
    const log = (msg: string) => {
      console.log(`[ZoomWebBot] ${msg}`);
      if (onLog) onLog(msg);
    };

    const targetUrl = ZoomWebBot.transformToWebClientUrl(options.meetingUrl);
    log(`Converted Zoom URL to Web Client format: ${targetUrl}`);

    const instance = await MediaStreamInjector.createBotBrowser(options);
    this.browser = instance.browser;
    this.page = instance.page;

    log(`Navigating to Zoom Web Client...`);
    await this.page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await this.page.waitForTimeout(3000);

    // Enter name input field
    const nameInputSelectors = [
      'input#inputname',
      'input[name="inputname"]',
      'input[placeholder="Your Name"]',
      'input[type="text"]',
    ];

    for (const selector of nameInputSelectors) {
      const input = await this.page.$(selector);
      if (input && await input.isVisible()) {
        log(`Filling display name: "${options.botName}"`);
        await input.fill(options.botName);
        break;
      }
    }

    // Enter passcode if prompt exists
    if (options.passcode) {
      const passcodeSelectors = ['input#inputpasscode', 'input[name="inputpasscode"]'];
      for (const selector of passcodeSelectors) {
        const passInput = await this.page.$(selector);
        if (passInput && await passInput.isVisible()) {
          log(`Entering passcode...`);
          await passInput.fill(options.passcode);
          break;
        }
      }
    }

    // Click Join Button
    log('Clicking Join button...');
    const joinBtnSelectors = [
      'button.preview-join-button',
      'button#joinBtn',
      'button:has-text("Join")',
      'button[type="submit"]',
    ];

    for (const selector of joinBtnSelectors) {
      const btn = await this.page.$(selector);
      if (btn && await btn.isVisible()) {
        await btn.click();
        break;
      }
    }

    await this.page.waitForTimeout(4000);

    // Handle "Join Audio by Computer" modal if visible
    log('Checking for Audio Connection prompt...');
    try {
      const joinAudioBtn = await this.page.waitForSelector('button:has-text("Join Audio by Computer")', { timeout: 8000 });
      if (joinAudioBtn) {
        log('Connecting Computer Audio...');
        await joinAudioBtn.click();
      }
    } catch {
      log('No Audio modal popped up or audio auto-connected.');
    }

    log('Zoom Bot successfully entered meeting context.');
  }

  public async leave(): Promise<void> {
    if (this.page) {
      try {
        const leaveBtn = await this.page.$('button:has-text("Leave")');
        if (leaveBtn) await leaveBtn.click();
      } catch (e) {
        console.warn('Could not click Leave button:', e);
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
