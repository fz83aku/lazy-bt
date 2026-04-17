class BraveHumanScroll {
  static id = "brave-human-scroll";

  async init(page, context) {
    await page.waitForTimeout(6000);

    // 🖱 echte initiale Interaktion
    await page.mouse.move(300, 300);
    await page.mouse.click(300, 300);
    await page.waitForTimeout(1500);

    let stagnant = 0;
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);

    while (stagnant < 5) {

      // 🐌 „menschliche Scroll-Session“
      const steps = 12 + Math.floor(Math.random() * 8);

      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, 180 + Math.random() * 80);

        // wichtig: kleine zufällige Pausen
        await page.waitForTimeout(300 + Math.random() * 400);
      }

      // 🧠 entscheidend: Idle Phase (trigger lazy loading)
      await page.waitForTimeout(4000);

      const newHeight = await page.evaluate(() => document.body.scrollHeight);

      if (newHeight === lastHeight) {
        stagnant++;
      } else {
        stagnant = 0;
        lastHeight = newHeight;
      }

      // 🧠 zusätzlicher „render breath“
      await page.waitForTimeout(2000);
    }

    // 🧭 final stabilisieren (wichtig für image swap completion)
    await page.waitForTimeout(8000);
  }
}

BraveHumanScroll;
