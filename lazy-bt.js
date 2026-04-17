class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    await page.waitForTimeout(4000); // initialer Render-Boost

    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    let safety = 0;

    while (currentHeight !== previousHeight && safety < 40) {
      safety++;

      previousHeight = currentHeight;

      // 🔽 kleiner Scroll statt großer Sprünge
      await page.evaluate(() => {
        window.scrollBy(0, 250);
      });

      // ⏳ wichtig: gibt Images Zeit für IntersectionObserver
      await page.waitForTimeout(2500);

      // 🔄 zusätzlicher "Render-Puffer"
      await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
      await page.waitForTimeout(1000);

      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    // 🧭 langsam bis ganz unten "setzen"
    await page.evaluate(async () => {
      const step = 200;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 400));
      }
    });

    await page.waitForTimeout(3000);
  }
}

SlowLazyScroll;
