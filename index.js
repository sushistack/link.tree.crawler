const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const CrawlService = require('./src/crawl');

const argv = yargs(hideBin(process.argv))
    .option('appHomeDir', {
        alias: 'd',
        type: 'string',
        demandOption: true,
        describe: 'Application home directory path',
    })
    .option('keywords', {
        alias: 'k',
        type: 'string',
        demandOption: true,
        describe: 'Keywords for crawling (JSON array format)',
    })
    .help()
    .argv;

(async () => {
    try {
        const appHomeDir = argv.appHomeDir;
        const keywords = JSON.parse(argv.keywords);

        if (!Array.isArray(keywords)) {
            throw new Error('Invalid keywords format. Expected a JSON array.');
        }

        console.log(`Starting crawl with appHomeDir: ${appHomeDir}`);
        console.log(`Keywords: ${keywords.join(', ')}`);

        // Create directories for each keyword
        keywords.forEach(keyword => {
            const keywordDir = path.join(appHomeDir, keyword);
            if (!fs.existsSync(keywordDir)) {
                fs.mkdirSync(keywordDir, { recursive: true });
                console.log(`Created directory: ${keywordDir}`);
            }
        });

        const crawlService = new CrawlService(appHomeDir);
        await crawlService.crawl(keywords);

        console.log('Crawling completed!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();