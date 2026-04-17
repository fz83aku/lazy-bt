class ShopWheelScroll {
  static id = "shop-wheel-scroll";

  async init(page, context) {
    await page.waitForTimeout(5000);

    // 🖱 echte user-like activation
    await page.mouse.move(400, 300);
    await page.mouse.click(400, 300);

    let stagnantRounds = 0;

    const getState = async () => {
      return await page.evaluate(() => {
        const imgs = Array.from(document.images);
        const loaded = imgs.filter(img => img.complete && img.naturalWidth > 0).length;
        return `${loaded}-${imgs.length}-${document.body.scrollHeight}`;
      });
    };

    let lastState = await getState();

    while (stagnantRounds < 6) {

      // 🐌 echtes Wheel Scrolling (entscheidend!)
      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 250);
        await page.waitForTimeout(600);
      }

      // 🧠 WICHTIG: lange Stabilisierung (trigger lazy images)
      await page.waitForTimeout(5000);

      const newState = await getState();

      if (newState === lastState) {
        stagnantRounds++;
      } else {
        stagnantRounds = 0;
        lastState = newState;
      }
    }

    // 🧭 final stabilisieren (kein Scroll mehr)
    await page.waitForTimeout(8000);
  }
}

ShopWheelScroll;
