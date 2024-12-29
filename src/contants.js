module.exports = {
    maxPage: 5,
    maxWords: 300,
    headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    articlesSelector: '#twcColl .c-item-doc',
    articleTitleSelector: '.item-title > c-title > strong > a',
    articleDescriptionSelector: '.item-contents c-contents-desc:nth-of-type(1) > p.conts-desc > a',
    articleContentSelectors: ['.blogview_content', '.tt_article_useless_p_margin', '.jb-cell-content', 'article', '.se-main-container'].map(it => `css=${it} h1,${it} h2,${it} h3,${it} h4,${it} h5,${it} h6,${it} p:not(.og-title):not(.og-host):not(.og-desc)`)
}