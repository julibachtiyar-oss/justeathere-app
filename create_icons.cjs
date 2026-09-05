const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function createIcons() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const getHtml = (size) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #d56075 0%, #9f3448 100%);
            font-family: system-ui, -apple-system, sans-serif;
          }
          .icon-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
          }
          .emblem {
            width: ${Math.round(size * 0.45)}px;
            height: ${Math.round(size * 0.45)}px;
            border-radius: ${Math.round(size * 0.1)}px;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 ${Math.round(size * 0.04)}px ${Math.round(size * 0.08)}px rgba(0,0,0,0.15);
            margin-bottom: ${Math.round(size * 0.03)}px;
          }
          .emblem svg {
            width: ${Math.round(size * 0.28)}px;
            height: ${Math.round(size * 0.28)}px;
          }
          .brand-text {
            font-size: ${Math.round(size * 0.1)}px;
            font-weight: 900;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .sub-text {
            font-size: ${Math.round(size * 0.045)}px;
            font-weight: 700;
            color: rgba(255,255,255,0.85);
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="icon-content">
          <div class="emblem">
            <svg viewBox="0 0 24 24" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
              <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
              <path d="M2 21h20" />
              <path d="M7 8v2" />
              <path d="M12 8v2" />
              <path d="M17 8v2" />
              <path d="M7 4h.01" />
              <path d="M12 4h.01" />
              <path d="M17 4h.01" />
            </svg>
          </div>
          <div class="brand-text">Justeathere</div>
          <div class="sub-text">POS & KASIR</div>
        </div>
      </body>
    </html>
  `;

  const publicDir = 'C:/Users/julib/.gemini/antigravity/scratch/justeathere-app/public';
  if (!fs.existsSync(publicDir + '/icons')) {
    fs.mkdirSync(publicDir + '/icons', { recursive: true });
  }

  const page = await browser.newPage();

  // 512
  await page.setViewport({ width: 512, height: 512 });
  await page.setContent(getHtml(512));
  await page.screenshot({ path: publicDir + '/icons/icon-512.png', omitBackground: false });
  console.log('Saved icon-512.png');

  // 192
  await page.setViewport({ width: 192, height: 192 });
  await page.setContent(getHtml(192));
  await page.screenshot({ path: publicDir + '/icons/icon-192.png', omitBackground: false });
  console.log('Saved icon-192.png');

  // Apple touch icon (180x180)
  await page.setViewport({ width: 180, height: 180 });
  await page.setContent(getHtml(180));
  await page.screenshot({ path: publicDir + '/icons/apple-touch-icon.png', omitBackground: false });
  console.log('Saved apple-touch-icon.png');

  await browser.close();
}

createIcons().catch(console.error);
