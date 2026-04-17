class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    await page.waitForTimeout(3000);

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    let safetyCounter = 0;

    while (currentHeight !== previousHeight && safetyCounter < 30) {
      safetyCounter++;
      previousHeight = currentHeight;

      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });

      await page.waitForTimeout(1500);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }
}

SlowLazyScroll;
