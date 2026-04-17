class KeyTriggerBehavior {
  static id = "key-trigger-minimal";

  async init(page, context) {
    // 🧠 kurz warten bis Grund-JS geladen ist
    await page.waitForTimeout(4000);

    // ⌨️ EINMALIGE Tasteneingabe (triggert Lazy Loading / hydration)
    await page.keyboard.press("ArrowDown");

    // 🧘 lange Idle-Phase, damit Bilder wirklich nachladen können
    await page.waitForTimeout(8000);

    // optional: noch ein kleiner "zweiter Trigger"
    await page.keyboard.press("ArrowDown");

    // 🧘 finale Stabilisierung
    await page.waitForTimeout(8000);
  }
}

KeyTriggerBehavior;
