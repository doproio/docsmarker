const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const globby = require('globby')
let docsComponentsDir = 'components'
const { parser } = require('@vuese/parser')
const { Render } = require('@vuese/markdown-render')
module.exports = async function (options, isWatch) {
    console.info('正在拷贝文件...')
    let dir = options.tmpPath
    if (!isWatch) {
        fs.removeSync(dir)
        fs.ensureDir(dir)
    }

    fs.copySync(path.join(__dirname, '../.vuepress'), path.join(dir, '.vuepress'))
    if (options.config) {
        if (path.join(process.cwd(), options.config)) {
            fs.copySync(path.join(process.cwd(), options.config), path.join(dir, '.vuepress'))
        }
    }

    handleConfig(path.join(dir, '.vuepress', 'config.js'), options.cwd)
    await copyFiles(options, dir, true)
    for (let i = 0; i < options.subProjects.length; i++) {
        await copyFiles(options.subProjects[i], dir)
    }
    return dir
}
function handleConfig (configFile, cwd) {
    let filecontent = fs.readFileSync(configFile, 'utf8')
    let projectpath = path.relative(path.dirname(configFile), cwd)
    filecontent = filecontent.replace(/{\{projectpath\}\}/g, path.join(projectpath))
    filecontent = filecontent.replace(/{\{projectmodules\}\}/g, path.join(projectpath, 'node_modules'))
    fs.writeFileSync(configFile, filecontent)
}
module.exports.copyFiles = copyFiles
async function copyFiles (options, tmpPath, isMain) {
    let prefix = options.name
    let tmpDir = tmpPath
    // 拷贝组件目录
    for (let i = 0; i < options.components.length; i++) {
        if (_.isString(options.components[i])) {
            let dir = path.join(options.cwd, options.components[i])
            if (fs.existsSync(dir)) {
                fs.copySync(dir, path.join(tmpDir, '.vuepress', docsComponentsDir, options.name))
            }
        }
    }
    // 拷贝入口文件,兼容大小写
    let home = options.home.replace('.md', '')
    fs.ensureFileSync(path.join(tmpDir, prefix, 'readme.md'))
    let homes = [
        home + '.md',
        home.toLowerCase() + '.md',
        home.toUpperCase() + '.md',
    ]
    for (let i = 0; i < homes.length; i++) {
        if (fs.existsSync(path.join(options.cwd, homes[i]))) {
            fs.copySync(path.join(options.cwd, homes[i]), path.join(tmpDir, prefix, 'readme.md'))
            if (isMain) {
                fs.ensureFileSync(path.join(tmpDir, 'readme.md'))
                fs.copySync(path.join(options.cwd, homes[i]), path.join(tmpDir, 'readme.md'))
            }
        }
    }

    // 生成组件md文件
    if (!options.ignoreComponents) {
        await genVueToMakedown(path.join(tmpDir, '.vuepress', docsComponentsDir, options.name), tmpDir)
    }

    // 拷贝文档文件
    for (let i = 0; i < options.docs.length; i++) {
        if (_.isString(options.docs[i])) {
            let dir = path.join(options.cwd, options.docs[i])
            if (fs.existsSync(dir)) {
                fs.copySync(dir, path.join(tmpDir, prefix))
            }
        }
    }

    // 拷贝静态文件
    for (let i = 0; i < options.public.length; i++) {
        if (_.isString(options.public[i])) {
            let dir = path.join(options.cwd, options.public[i])
            if (fs.existsSync(dir)) {
                fs.copySync(dir, path.join(tmpDir, '.vuepress/public', options.name))
            }
        }
    }
}

async function genVueToMakedown (dir, docsDir, project) {
    let files = await globby(path.join(dir, '**/*.vue'))
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        const source = fs.readFileSync(file, 'utf-8')
        try {
            let parserRes = parser(source)

            let relativeDir = path.relative(path.join(dir, '../'), file)
            parserRes = formatParserRes(parserRes, relativeDir)
            const r = new Render(parserRes)
            const markdownRes = r.render()
            let pathJson = path.parse(relativeDir)
            let dirArr = pathJson.dir.split('/')
            let mdFile = path.join(docsDir, dirArr[0], 'components', dirArr.slice(1, dirArr.length).join('/'), pathJson.name + '.md')
            fs.ensureFileSync(mdFile)
            if (markdownRes) {
                let componentName = `${pathJson.dir.split('/').join('-')}-${pathJson.name}`
                if (!pathJson.dir) {
                    componentName = `${pathJson.name}`
                }

                let md = renderMarkdown(parserRes, markdownRes, componentName)
                fs.writeFileSync(mdFile, md)
            }
        } catch (e) {
            console.error(e)
        }
    }
}

function formatParserRes (parserRes, file) {
    if (!parserRes.name) {
        let name = path.parse(file).name
        if (name === 'index') {
            name = path.basename(path.parse(file).dir)
        }
        parserRes.name = name
    }
    if (parserRes.props) {
        for (let i = 0; i < parserRes.props.length; i++) {
            let prop = parserRes.props[i]

            if (prop.typeDesc) {
                try {
                    let values = prop.typeDesc[0]

                    // eslint-disable-next-line no-useless-escape
                    values = values.replace(/'/g, '\"')
                    values = JSON.parse(values)
                    if (values.length > 0) {
                        prop.values = values
                    }
                    parserRes.props[i] = prop
                } catch (error) {
                    // console.log(error)
                }
            }
        }
    }

    if (parserRes.componentDesc) {
        for (let key in parserRes.componentDesc) {
            let componentDesc = parserRes.componentDesc[key]
            for (let i = 0; i < componentDesc.length; i++) {
                try {
                    // eslint-disable-next-line no-useless-escape
                    let desc = componentDesc[i].replace(/'/g, '\"')
                    parserRes.componentDesc[key][i] = JSON.parse(desc)
                    console.log(JSON.parse(desc))
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }
    return parserRes
}

function renderMarkdown (parserRes, markdownRes, componentName) {
    let md = `# ${parserRes.name}\n\n`
    for (let key in parserRes.componentDesc) {
        if (key !== 'default') {
            continue
        }
        let val = parserRes.componentDesc[key]
        for (let i = 0; i < val.length; i++) {
            md += val[i] + '\n'
        }
    }
    let previewMD = ''
    md += `## 预览\n\n`

    if (parserRes.componentDesc.example) {
        let example = parserRes.componentDesc.example
        for (let i = 0; i < example.length; i++) {
            let keyval = ''
            if (typeof example[i] !== 'object') {
                continue
            }
            for (let key in example[i]) {
                if (typeof example[i][key] === 'object') {
                    keyval += ` :${key}='${JSON.stringify(example[i][key])}'`
                } else {
                    keyval += ` ${key}='${example[i][key]}'`
                }
            }
            console.log(keyval)
            previewMD += `::: demo vue
            \n<${componentName} ${keyval}/>
            \n:::\n\n`
        }
    } else {
        let keyval = ''
        for (let i = 0; parserRes.props && i < parserRes.props.length; i++) {
            let prop = parserRes.props[i]
            if (prop.default) {
                keyval += `${prop.name}="${prop.default}" `
            }
        }
        previewMD += `::: demo vue
        \n<${componentName} ${keyval}/>
        \n:::\n\n`
    }

    if (!previewMD) {
        md += `::: demo vue
        \n<${componentName}/>
        \n:::\n\n`
    } else {
        md += previewMD
    }
    for (let key in markdownRes) {
        md += `## ${key}\n\n`
        md += markdownRes[key]
    }
    return md
}
