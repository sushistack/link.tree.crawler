const { headings } = require('./contants')

class Html2MarkdownConverter {
    static async convert(elements) {
        const minHeadNumber = await this.getMinHeadNumber(elements);
        const markdown = await Promise.all(
            elements.map(async (el) => {
                const tagName = (await el.evaluate(e => e.tagName)).toLowerCase();
                const text = await el.innerText();
                return `${this.head2Hash(tagName, minHeadNumber)} ${text}\n`;
            })
        );
        return markdown.join('');
    }

    static head2Hash(tagName, minHeadNumber) {
        if (headings.includes(tagName)) {
            const headNumber = parseInt(tagName.replace('h', ''), 10);
            if (headNumber >= minHeadNumber) {
                return `\n${'#'.repeat(headNumber - minHeadNumber + 2)}`;
            }
        }
        return '';
    }

    static async getMinHeadNumber(elements) {
        const headingLevels = await Promise.all(
            elements.map(async (el) => {
                const tagName = (await el.evaluate((el) => el.tagName)).toLowerCase();
                if (headings.includes(tagName)) {
                    return parseInt(tagName.replace('h', ''), 10);
                }
                return null;
            })
        );

        const validLevels = headingLevels.filter((level) => level !== null);
        return validLevels.length > 0 ? Math.min(...validLevels) : 7;
    }
}

module.exports = Html2MarkdownConverter;