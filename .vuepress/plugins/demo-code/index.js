const path = require('path')
const { encodeAndStringify } = require('./utils')
const markdownItContainer = require('markdown-it-container')
const markdown=require("@vuepress/markdown")
const defaults = {
    onlineBtns: {
        codepen: false,
        jsfiddle: false,
        codesandbox: false,
    },
    // https://codesandbox.io/docs/importing#define-api
    codesandbox: {
        deps: {}, // dependencies
        json: '',
        query: 'module=App.vue',
        embed: '',
    },
}

module.exports = (options = {},context) => {
    const { demoCodeMark = 'demo' } = options
    const END_TYPE = `container_${demoCodeMark}_close`
    const markdownConfig=options.markdownConfig||{};
    
    return {
        name: 'vuepress-plugin-demo-code',
        enhanceAppFiles: [
            path.resolve(__dirname, 'enhanceAppFile.js'),
        ],
        markdown: {
            lineNumbers: true
        },
        extendMarkdown: (md) => {
            md.use(markdownItContainer, demoCodeMark, { render })
        },
    }

    function render (tokens, idx) {
        const { nesting, info } = tokens[idx]
        
        if (nesting === -1) {
            let ret= '</template></DemoAndCode>\n';

            return ret;
        }

        let htmlStr = ''
        let lastLine = 0
        let language = info.split(demoCodeMark)[1] || 'vue';
        for(let i=0;i<language.split(" ").length;i++){
            if(language.split(" ")[i]){
                language=language.split(" ")[i];
            }
        }
        const platform=info.split(" ")[info.split(" ").length-1];
        for (let index = idx; index < tokens.length; index++) {
            const { map, type, content } = tokens[index]

            if (type === END_TYPE) break
            if (type === 'html_block') {
                const delta = map[0] - (lastLine || map[1])

                if (delta > 0) {
                    htmlStr += '\n'.repeat(delta)
                }

                htmlStr += content
                lastLine = map[1]
            }
        }
        codeStr='\n```'+language+'\n'+htmlStr+'\n```\n';
        codeStr=markdown(markdownConfig).render(codeStr).html;
        const {
            jsLibs = [],
            cssLibs = [],
            showText = 'show code',
            hideText = 'hide code',
            minHeight,
        } = options

        let onlineBtns = Object.assign({}, defaults.onlineBtns, options.onlineBtns)
        if(platform){
            onlineBtns[platform]=true;
        }
        
        const codesandbox = Object.assign({}, defaults.codesandbox, options.codesandbox)

        const jsLibsStr = encodeAndStringify(jsLibs)
        const cssLibsStr = encodeAndStringify(cssLibs)
        const onlineBtnsStr = encodeAndStringify(onlineBtns)
        const codesandboxStr = encodeAndStringify(codesandbox)

        return `
            <DemoAndCode
                htmlStr="${encodeURIComponent(htmlStr)}"
                showText="${showText}"
                hideText="${hideText}"
                jsLibsStr="${jsLibsStr}"
                cssLibsStr="${cssLibsStr}"
                :minHeight="${minHeight}"
                onlineBtnsStr="${onlineBtnsStr}"
                codesandboxStr="${codesandboxStr}"
            >
                <template slot="code">
                    ${codeStr}
                </template>
                <template slot="demo">
        `
    }
}
