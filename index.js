const vuepress = require("vuepress");
const path =require("path");
const parseOptions = require("./lib/parseOptions");
const makeFiles = require("./lib/makeFiles");
const genNavAndSidebar = require("./lib/genNavAndSidebar");
const chokidar = require('chokidar');
const _ = require("lodash")
const vuepressOptions={
    theme: '@vuepress/default', 
    '--': [], 
    cache: true
};
module.exports={
    async dev(){
        let options = await parseOptions("dev");
        watchFiles(options);
        let docsDir = await makeFiles(options);
        await genNavAndSidebar(docsDir,options);
        process.chdir(__dirname);
        vuepress.dev(docsDir,vuepressOptions);
    },
    async build(){
        let options = await parseOptions("build");
        let docsDir = await makeFiles(options);
        await genNavAndSidebar(docsDir,options);
        process.chdir(__dirname);
        vuepressOptions.dest=path.join(options.cwd,options.dest);
        vuepress.build(docsDir,vuepressOptions);
    }
}
function watchFiles(options){
    let files = _.concat(options.home, options.components,options.docs);
    chokidar.watch(files).on('all',async (event, path, details)=>{
        let docsDir = await makeFiles(options);
        await genNavAndSidebar(docsDir,options);
    })
}