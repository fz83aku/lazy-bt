export default async function behavior(context) {
  const { page } = context;

  // Seite laden und warten bis initiale Requests durch sind
  await page.goto("https://example.com", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // kleine Startpause (manche Seiten initialisieren Lazy Loading spät)
  await page.waitForTimeout(3000);

  let sameCount = 0;
  let lastHeight = 0;

  while (true) {
    // aktuelle Höhe holen
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    // langsam scrollen (wichtig für Lazy Loading)
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400; // kleine Schritte
        const delay = 300;    // Pause zwischen Steps

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, delay);
      });
    });

    // warten, damit Inhalte nachladen können
    await page.waitForTimeout(2500);

    // prüfen ob neue Inhalte geladen wurden
    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    if (newHeight === currentHeight) {
      sameCount++;
    } else {
      sameCount = 0;
    }

    lastHeight = newHeight;

    // Abbruch: wenn mehrfach nichts mehr passiert
    if (sameCount >= 3) {
      break;
    }
  }

  // 🖼️ Optional: warten bis Bilder geladen sind (mit Timeout-Schutz)
  try {
    await page.waitForFunction(() => {
      const imgs = Array.from(document.images);
      return imgs.every(img => img.complete);
    }, { timeout: 10000 });
  } catch (e) {
    // Ignorieren, falls einige Bilder nie vollständig laden
  }

  // ⏳ Extra Wartezeit für letzte Lazy Loads
  await page.waitForTimeout(5000);

  // 🔝 optional: wieder nach oben scrollen (manche Seiten laden oben nochmal Content)
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(2000);
}
