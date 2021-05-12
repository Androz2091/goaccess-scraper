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
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const url = config.url
            .replace('{year}', year)
            .replace('{month}', month)
            .replace('{day}', day);
        await page.goto(url);
        await page.waitForSelector('#valid_requests');
        const textContent = await page.evaluate(() => {
            return parseInt(document.querySelector("#valid_requests").textContent.split('').filter((char) => !isNaN(char)).join(''));
        });
        results.push({
            value: textContent,
            date: `${year}-${month}-${day}`
        });
    }

    writeFileSync(config.output, JSON.stringify(results));
    process.exit(0);

})();
