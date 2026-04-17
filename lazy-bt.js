class ShopNetworkAwareScroll {
  static id = "shop-network-aware-scroll";

  async init(page, context) {
    await page.waitForTimeout(5000);

    // 🖱 initial activation (triggers lazy systems)
    try {
      await page.mouse.move(400, 300);
      await page.mouse.click(400, 300);
    } catch (e) {}

    // 📦 track network activity (images / assets)
    let recentNetworkHits = 0;

    page.on("response", (res) => {
      try {
        const url = res.url();
        if (
          url.includes(".jpg") ||
          url.includes(".png") ||
          url.includes(".webp") ||
          url.includes("image") ||
          url.includes("cdn")
        ) {
          recentNetworkHits++;
          setTimeout(() => recentNetworkHits--, 5000);
        }
      } catch (e) {}
    });

    const getDomSignature = async () => {
      return await page.evaluate(() => {
        const imgs = document.querySelectorAll("img").length;
        const cards = document.querySelectorAll("article, li, div").length;
        return `${imgs}-${cards}-${document.body.scrollHeight}`;
      });
    };

    let lastSignature = await getDomSignature();

    let stagnantRounds = 0;
    let scrollY = 0;

    while (stagnantRounds < 5) {
      // 🐌 sehr langsames Scrollen
      for (let i = 0; i < 25; i++) {
        scrollY += 120;

        await page.evaluate((y) => {
          window.scrollTo(0, y);
        }, scrollY);

        await page.waitForTimeout(400);
      }

      // ⏳ warten auf lazy images + network
      await page.waitForTimeout(4000);

      const newSignature = await getDomSignature();

      const networkActive = recentNetworkHits > 0;

      // 🧠 Entscheidungslogik
      if (newSignature === lastSignature && !networkActive) {
        stagnantRounds++;
      } else {
        stagnantRounds = 0;
        lastSignature = newSignature;
      }

      // 🧠 Frame sync (stabilisiert lazy observers)
      await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    }

    // 🧭 finaler langsamer Sweep nach unten
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);

    for (let y = 0; y < finalHeight; y += 80) {
      await page.evaluate((pos) => {
        window.scrollTo(0, pos);
      }, y);

      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(4000);
  }
}

ShopNetworkAwareScroll;
