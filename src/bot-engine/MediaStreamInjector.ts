import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';

export interface LaunchBotOptions {
  headless?: boolean;
  videoFilePath?: string;
  audioFilePath?: string;
  botName: string;
}

export class MediaStreamInjector {
  public static getChromiumArgs(options: LaunchBotOptions): string[] {
    const args = [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-size=1280,720',
      '--lang=en-US,en',
    ];

    if (options.videoFilePath) {
      args.push(`--use-file-for-fake-video-capture=${path.resolve(options.videoFilePath)}`);
    }

    return args;
  }

  public static async createBotBrowser(options: LaunchBotOptions): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    const args = this.getChromiumArgs(options);

    const browser = await chromium.launch({
      headless: options.headless !== undefined ? options.headless : (process.env.HEADLESS === 'true'),
      args,
    });

    const context = await browser.newContext({
      permissions: ['microphone', 'camera'],
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    const page = await context.newPage();

    // Inject comprehensive stealth patches
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      (window as any).chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    return { browser, context, page };
  }
}
