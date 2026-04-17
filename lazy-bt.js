module.exports = class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    // kurze Startwartezeit für initiales Rendering
    await page.waitForTimeout(3000);

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    let safety = 0;
    const maxIterations = 30;

    while (currentHeight !== previousHeight && safety < maxIterations) {
      safety++;

      previousHeight = currentHeight;

      // langsames Scrollen in kleinen Schritten
      await page.evaluate(() => {
        window.scrollBy(0, 600);
      });

      // warten, damit Lazy Content nachladen kann
      await page.waitForTimeout(2000);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    // final ans Ende springen
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }
};
