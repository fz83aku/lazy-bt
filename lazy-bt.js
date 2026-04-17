class ShopAwareScroll {
  static id = "shop-aware-scroll";

  async init(page, context) {
    // 🧠 Initial stabilisieren lassen
    await page.waitForTimeout(5000);

    // 🖱 optional: user-like interaction (aktiviert lazy systems)
    try {
      await page.mouse.move(300, 300);
      await page.mouse.click(300, 300);
    } catch (e) {}

    let previousContentHash = "";
    let stagnantRounds = 0;
    let scrollY = 0;

    const getContentHash = async () => {
      return await page.evaluate(() => {
        // grober, aber effektiver DOM-Fingerprint
        const items = document.querySelectorAll("img, picture, article, div");
        return items.length + "-" + document.body.scrollHeight;
      });
    };

    previousContentHash = await getContentHash();

    while (stagnantRounds < 4) {
      // 🐌 langsames Scrollen in kleinen Schritten
      for (let i = 0; i < 40; i++) {
        scrollY += 150;

        await page.evaluate((y) => {
          window.scrollTo(0, y);
        }, scrollY);

        await page.waitForTimeout(300);
      }

      // ⏳ warten auf Lazy Load + Network + rendering
      await page.waitForTimeout(3000);

      // 🧠 prüfen ob neue Inhalte erschienen sind
      const newHash = await getContentHash();

      if (newHash === previousContentHash) {
        stagnantRounds++;
      } else {
        stagnantRounds = 0;
        previousContentHash = newHash;
      }

      // 🧠 extra Frame-Stabilisierung
      await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    }

    // 🧭 final langsam bis Ende scrollen
    let height = await page.evaluate(() => document.body.scrollHeight);

    for (let y = 0; y < height; y += 100) {
      await page.evaluate((pos) => {
        window.scrollTo(0, pos);
      }, y);

      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(3000);
  }
}

ShopAwareScroll;
