const { writeFileSync } = require('fs');
const puppeteer = require('puppeteer');
const config = require("./config.json");

(async () => {

    const browser = await puppeteer.launch({
        headless: config.headless
    });

    const page = await browser.newPage();

    const [day, month, year] = config.start.split('-');
    const dateStart = new Date();
    dateStart.setFullYear(year);
    dateStart.setMonth(month-1);
    dateStart.setDate(day);

    const now = new Date();

    const results = [];

    for (let date = dateStart; date.getTime() <= now.getTime(); date.setDate(date.getDate() + 1)) {
        const url = config.url
            .replace('{year}', date.getFullYear())
            .replace('{month}', date.getMonth() + 1)
            .replace('{day}', date.getDate());
        await page.goto(url);
        await page.waitForSelector('#valid_requests');
        const textContent = await page.evaluate(() => {
            return parseInt(document.querySelector("#valid_requests").textContent);
        });
        results.push(textContent);
    }

    writeFileSync(config.output, JSON.stringify(results));

})();
