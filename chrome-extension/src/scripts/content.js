const puppeteer = require('puppeteer');

console.log("HOWDY!");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https//www.google.com');
    await page.screenshot({ path: 'example.png' });
    await browser.close();
})();