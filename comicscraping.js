const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeComic(url, cacheDir) {
    try {
        await fs.mkdir(cacheDir);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    let comicUrls = [];

    for (let pageNum = 1; pageNum <= 10; pageNum++) {
        const pageUrl = `${url}/page/${pageNum}`;
        console.log(`Scraping ${pageUrl}...`);

        const cacheFile = `${cacheDir}/page_${pageNum}.html`;
        let pageContent;

        try {
            pageContent = await fs.readFile(cacheFile, 'utf-8');
        } catch (error) {
            const response = await axios.get(pageUrl);
            pageContent = response.data;
            await fs.writeFile(cacheFile, pageContent, 'utf-8');
        }

        const $ = cheerio.load(pageContent);
        const comicImg = $('.img-responsive.center-block').attr('src');
        if (comicImg) {
            comicUrls.push(comicImg);
        }

        // Add delay between requests to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return comicUrls;
}

async function main() {
    const dilbertUrl = 'https://dilbert.com';
    const cacheDirectory = 'dilbert_cache';

    const comicUrls = await scrapeComic(dilbertUrl, cacheDirectory);

    console.log("Scraped Comic URLs:");
    comicUrls.forEach(url => console.log(url));
}

main();
