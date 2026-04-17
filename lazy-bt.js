module.exports = {
  id: "simple-scroll-behavior",

  async behavior(context) {
    const { page } = context;

    console.log("Behavior started");

    await page.waitForTimeout(3000);

    // 🖱️ Klick
    await page.mouse.click(200, 200);

    await page.waitForTimeout(2000);

    // 🐢 langsames Scrollen
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const delay = 500;

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

    await page.waitForTimeout(5000);

    console.log("Done");
  }
};
