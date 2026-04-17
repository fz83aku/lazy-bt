export default class SlowLazyScroll {
  constructor() {
    this.name = "slow-lazy-scroll";
  }

  async init(page, context) {
    // kurze Start-Wartezeit, damit erste Inhalte laden
    await page.waitForTimeout(3000);

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    // solange scrollen, bis sich die Seitenhöhe nicht mehr verändert
    while (currentHeight !== previousHeight) {
      previousHeight = currentHeight;

      // langsam nach unten scrollen in kleinen Schritten
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300;

          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 500); // langsames Scroll-Intervall
        });
      });

      // warten, damit Lazy Content nachladen kann
      await page.waitForTimeout(2000);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    // am Ende kurz ganz nach unten sichern
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }
}
