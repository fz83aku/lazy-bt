function behavior(context) {
  const { page } = context;

  console.log("Behavior started");

  return (async () => {

    // kurze Pause nach Seitenladen
    await page.waitForTimeout(3000);

    // 🖱️ einfacher Klick (mittig auf die Seite)
    await page.mouse.click(200, 200);

    // kleine Pause nach Klick
    await page.waitForTimeout(2000);

    // 🐢 langsames Scrollen
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300; // kleine Schritte
        const delay = 500;    // langsam!

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

    // ⏳ am Ende warten (für Bilder)
    await page.waitForTimeout(5000);

    console.log("Done scrolling");

  })();
}
