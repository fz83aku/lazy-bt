class RealUserTrigger {
  static id = "real-user-trigger";

  async init(page, context) {
    await page.waitForTimeout(4000);

    // 🖱 1. echten Fokus setzen (entscheidend!)
    await page.mouse.move(300, 300);
    await page.mouse.click(300, 300);

    await page.waitForTimeout(500);

    // ⌨️ 2. echte Tastatursequenz (nicht nur press)
    await page.keyboard.down("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.up("ArrowDown");

    await page.waitForTimeout(2000);

    // 🧘 3. Idle-Zeit für Lazy Loading / hydration
    await page.waitForTimeout(10000);
  }
}

RealUserTrigger;
