const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const globby = require("globby");
const md5 = require("md5");
let docsOptions={
    name:"",
    title:"",
    docs:["docsmaker"],
    home:"readme.md",
    components:[],
    subPatterns:"",
    cwd:"",
    subProjects:[],
    config:"",
    dest:"docs",
    translate:{
        "components":"组件",
        "intro":"介绍",
        "example":"示例"
    }
}
module.exports =async function(status){
    console.info("正在解析参数...")
    
    let options = getOptions(process.cwd());
    options.tmpPath = path.join(__dirname,"../.docsmaker",md5(process.cwd()+status));
    let subProjects=[];
    if(options.subPatterns){
        let files=await globby(path.join(process.cwd(),options.subPatterns),{ onlyDirectories: true, deep: 0 });
        subProjects=files;
        subProjects=_.pull(subProjects, process.cwd());
    }
    for(let i=0;i<subProjects.length;i++){
        options.subProjects.push(getOptions(subProjects[i]));
    }
    return options;
}
function getOptions(cwd){
    
    let file = path.join(cwd,'package.json');
    
    let options={};
    if(fs.existsSync(file)){
        options=fs.readFileSync(file,"utf8");
        options = JSON.parse(options).docs;
    }
    options=_.defaultsDeep(options, docsOptions);
    options.cwd=cwd;
    // options = Object.assign(docsOptions,options);
    let dirname = path.dirname(file).split("/");
    dirname = dirname[dirname.length-1];
    options.name = options.name||dirname;
    options.title = options.title||dirname;
    options.docs = formatArray(options.docs);
    options.components = formatArray(options.components);
    docsOptions.translate = options.translate;
    return options;
}
function formatArray(val){
    if(_.isArray(val)){
        return val;
    }
    if(_.isString(val)){
        return [val];
    }
    return [];
}