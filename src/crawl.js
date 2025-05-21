const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const con = require('./contants')
const config = require('../playwright.config')
const Html2MarkdownConverter = require('./html2markdown');

class CrawlService {
    constructor(appHomeDir) {
        this.appHomeDir = appHomeDir;
        this.articleCounter = 0;
    }

    async crawl(keywords) {
        const notCrawledKeywords = keywords.filter(keyword => !fs.existsSync(this.articleDirPath(keyword)));

        const browser = await chromium.launch(config.browserOptions);
        const page = await browser.newPage();
        try {
            for (const keyword of notCrawledKeywords) {
                const dirPath = this.articleDirPath(keyword);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                    console.log(`Created directory: ${dirPath}`);
                }
                for (let pageNumber = 1; pageNumber <= con.maxPage; pageNumber++) {
                    console.log(`Keyword: ${keyword}, Page: ${pageNumber}`);
                    const searchUrl = this.getSearchUrl(keyword, pageNumber);
                    await page.goto(searchUrl);

                    const locators = await page.locator(con.articlesSelector).all();
                    await this.collect(page, locators, keyword);
                }
            }
        } finally {
            await browser.close();
        }
    }

    async collect(page, locators, keyword) {
        for (const locator of locators) {
            try {
                const titleLocator = await locator.locator(con.articleTitleSelector);
                const descLocator = await locator.locator(con.articleDescriptionSelector);

                const titleText = await titleLocator.innerText();
                const descText = await descLocator.innerText();
                const href = await titleLocator.getAttribute('href');

                if (!href) continue;

                const content = await this.crawlContent(href);

                const article = {
                    title: titleText,
                    description: descText,
                    content,
                };

                if (content.split(' ').length > con.maxWords) {
                    this.writeArticle(article, keyword);
                    console.log('Write article successfully!');
                } else {
                    console.log('Skip writing article.');
                }
            } catch (error) {
                console.error(`Error processing locator: ${error.message}`);
            }
        }
    }

    async crawlContent(url) {
        const browser = await chromium.launch(config.browserOptions);
        const page = await browser.newPage(config.articlePageOptions);
        let content = '';
        try {
            await page.goto(url);

            for (const selector of con.articleContentSelectors) {
                const elements = await page.locator(selector).all();
                content = await Html2MarkdownConverter.convert(elements);
                if (content) break;
            }
        } catch (error) {
            console.error(`Error crawling content: ${error.message}`);
        } finally {
            await browser.close();
        }
        return content;
    }

    writeArticle(article, keyword) {
        const dirPath = this.articleDirPath(keyword);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${this.articleCounter++}.json`);
        fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
    }

    articleDirPath(keyword) {
        return path.join(this.appHomeDir, 'files', 'articles', keyword);
    }

    getSearchUrl(keyword, page) {
        return `https://search.daum.net/search?w=fusion&col=blog&q=${keyword}&DA=TWA&p=${page}`;
    }
}

module.exports = CrawlService;