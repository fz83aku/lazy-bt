class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    await page.waitForTimeout(3000);

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    let safety = 0;

    while (currentHeight !== previousHeight && safety < 30) {
      safety++;

      previousHeight = currentHeight;

      await page.evaluate(() => {
        window.scrollBy(0, 600);
      });

      await page.waitForTimeout(2000);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }
}

// wichtig: Klasse als globales Ergebnis zurückgeben
SlowLazyScroll;
