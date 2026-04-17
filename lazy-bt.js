export default async function behavior(context) {
  const { page } = context;

  await page.goto("https://example.com");

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}
