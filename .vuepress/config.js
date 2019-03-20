const demoCode = require("./plugins/demo-code")
const fs = require("fs");
const path = require("path");
let navAndSidebar = fs.readFileSync(path.join(__dirname,"./navAndSidebar.json"),"utf8");
navAndSidebar = JSON.parse(navAndSidebar);
const isLineNumber=false;
module.exports = {
    base: '',
    configureWebpack: {
        resolve: {
            alias: {
            'ui':'../../'
            }
        }
    },
    title:navAndSidebar.options.title,
    head: [
        // ['link', { rel: 'icon', href: `/favicon.ico` }]
    ],
    
    markdown: {
        lineNumbers: isLineNumber,
        extendMarkdown: (md) => {
            md.use(require('markdown-it-include'), {
                root: './docs/',
                includeRe: /<\[include\]\((.+)\)/i,
            })
        },
    },
    plugins: [
        ['smooth-scroll'],
        [demoCode, {
            cssLibs: [
            ],
            markdownConfig:{
                lineNumbers: isLineNumber,
            },
            showText: 'show more',
            hideText: 'hide',
        }],
    ],
    evergreen: true,
    serviceWorker: true,
    themeConfig: {
        docsDir: 'docs',
        sidebarDepth: 2,
        // editLinks: true,
        serviceWorker: {
            updatePopup: {
                message: 'New content is available.',
                buttonText: 'Refresh',
            },
        },
        nav:navAndSidebar.nav,
        // nav:'auto',
        sidebar:navAndSidebar.sidebar,
    }
}
