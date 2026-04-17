class SlowLazyScroll {
  static id = "slow-lazy-scroll";

  async init(page, context) {
    // 🧠 Initial warten (wichtig für JS-heavy Shops)
    await page.waitForTimeout(5000);

    // 🖱 optionaler "aktivierender Klick"
    try {
      await page.mouse.click(200, 200);
    } catch (e) {}

    let previousHeight = await page.evaluate(() => document.body.scrollHeight);
    let currentY = 0;

    let sameHeightCount = 0;

    while (sameHeightCount < 3) {
      let stepCount = 0;

      // 🐌 extrem langsames pixelweises Scrollen
      while (stepCount < 2000) {
        await page.evaluate((y) => {
          window.scrollTo(0, y);
        }, currentY);

        currentY += 2; // 🔑 1–2px pro Schritt (sehr wichtig)

        // 🧠 Frame sync (verhindert "Jump Scroll")
        await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));

        // 💤 bewusst langsamer Rhythmus
        if (stepCount % 20 === 0) {
          await page.waitForTimeout(80);
        }

        stepCount++;
      }

      // ⏳ warten auf Lazy Images / Network
      await page.waitForTimeout(3000);

      const newHeight = await page.evaluate(() => document.body.scrollHeight);

      if (newHeight === previousHeight) {
        sameHeightCount++;
      } else {
        sameHeightCount = 0;
        previousHeight = newHeight;
      }
    }

    // 🧭 final langsam bis Ende
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 1) {
        window.scrollTo(0, y);
        if (y % 50 === 0) {
          await new Promise(r => setTimeout(r, 30));
        }
      }
    });

    await page.waitForTimeout(3000);
  }
}

SlowLazyScroll;
