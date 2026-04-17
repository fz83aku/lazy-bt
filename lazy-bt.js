class KeyboardScrollBehavior {
  static id = "keyboard-scroll";

  async init(page, context) {
    await page.waitForTimeout(6000);

    // 🧠 initiale Aktivierung (wichtig für Fokus + JS listeners)
    try {
      await page.mouse.move(300, 300);
      await page.mouse.click(300, 300);
    } catch (e) {}

    let stagnant = 0;
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);

    while (stagnant < 6) {

      // ⌨️ Fokus sicherstellen
      await page.keyboard.press("ArrowDown");

      // 🐌 langsames „lesen“-ähnliches Verhalten
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(250 + Math.random() * 200);
      }

      // 🧠 Idle Phase für Lazy Images / hydration
      await page.waitForTimeout(4000);

      const newHeight = await page.evaluate(() => document.body.scrollHeight);

      if (newHeight === lastHeight) {
        stagnant++;
      } else {
        stagnant = 0;
        lastHeight = newHeight;
      }

      // 🧘 zusätzlicher Render-Puffer
      await page.waitForTimeout(2000);
    }

    // 🧭 final stabilisieren
    await page.waitForTimeout(8000);
  }
}

KeyboardScrollBehavior;
