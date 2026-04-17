module.exports = class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    // kurze Startwartezeit für initiales Rendering
    await page.waitForTimeout(3000);

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    // Scrollen bis keine neue Content-Höhe mehr erscheint
    while (currentHeight !== previousHeight) {
      previousHeight = currentHeight;

      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let total = 0;
          const step = 300;

          const timer = setInterval(() => {
            window.scrollBy(0, step);
            total += step;

            if (total >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 500);
        });
      });

      // Zeit für Lazy Loading
      await page.waitForTimeout(2000);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    // final sicher ans Seitenende scrollen
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }
};
