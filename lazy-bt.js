async function behavior(context) {
  const { page } = context;

  await page.goto("https://example.com", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await page.waitForTimeout(3000);

  let sameCount = 0;

  while (true) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const delay = 300;

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

    await page.waitForTimeout(2500);

    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    if (newHeight === currentHeight) {
      sameCount++;
    } else {
      sameCount = 0;
    }

    if (sameCount >= 3) break;
  }

  try {
    await page.waitForFunction(() => {
      const imgs = Array.from(document.images);
      return imgs.every(img => img.complete);
    }, { timeout: 10000 });
  } catch (e) {}

  await page.waitForTimeout(5000);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
}
