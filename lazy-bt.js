function behavior(context) {
  const { page } = context;

  return (async () => {
    console.log("Behavior started");

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

    console.log("Scrolling finished");
  })();
}
