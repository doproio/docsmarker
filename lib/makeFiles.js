const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const globby = require("globby");
let docsComponentsDir="components";
const {parser} = require("@vuese/parser");
const {Render} = require('@vuese/markdown-render');
module.exports =async function(options){
    console.info("正在拷贝文件...");
    let dir = options.tmpPath;
    fs.removeSync(dir)
    fs.ensureDir(dir);
    fs.copySync(path.join(__dirname,"../.vuepress"),path.join(dir,".vuepress"));
    if(options.config){
        if(path.join(process.cwd(),options.config)){
            fs.copySync(path.join(process.cwd(),options.config),path.join(dir,".vuepress"));
        }
    }
    
    handleConfig(path.join(dir,".vuepress","config.js"),options.cwd);
    await copyFiles(options,dir,true);
    for(let i=0;i<options.subProjects.length;i++){
        await copyFiles(options.subProjects[i],dir);
    }
    return dir;

}
function handleConfig(configFile,cwd){
    let filecontent = fs.readFileSync(configFile,'utf8');
    let projectpath = path.relative(path.dirname(configFile),cwd);
    filecontent=filecontent.replace(/{\{projectpath\}\}/g,path.join(projectpath));
    filecontent=filecontent.replace(/{\{projectmodules\}\}/g,path.join(projectpath,"node_modules"));
    fs.writeFileSync(configFile,filecontent);
}
async function copyFiles(options,tmpPath,isMain){
    let prefix = isMain?"":options.name;
    let tmpDir = tmpPath;
    // 拷贝组件目录
    for(let i=0;i<options.components.length;i++){
        if(_.isString(options.components[i])){
            let dir = path.join(options.cwd,options.components[i]);
            if(fs.existsSync(dir)){
                fs.copySync(dir,path.join(tmpDir,".vuepress",docsComponentsDir,prefix));
            }
        }
    }
    // 拷贝入口文件
    if(fs.existsSync(path.join(options.cwd,options.home))){
        fs.ensureFileSync(path.join(tmpDir,prefix,'readme.md'));
        fs.copySync(path.join(options.cwd,options.home),path.join(tmpDir,prefix,'readme.md'));
    }
    
    // 生成组件md文件
    await genVueToMakedown(path.join(tmpDir,".vuepress",docsComponentsDir),tmpDir);

    // 拷贝文档文件
    for(let i=0;i<options.docs.length;i++){
        if(_.isString(options.docs[i])){
            let dir = path.join(options.cwd,options.docs[i]);
            if(fs.existsSync(dir)){
                fs.copySync(dir,path.join(tmpDir,prefix));
            }
        }
    }
}

async function genVueToMakedown(dir,docsDir,project){
    let files=await globby(path.join(dir,'**/*.vue'));
    
    for(let i=0;i<files.length;i++){
        let file = files[i];
        const source = fs.readFileSync(file, 'utf-8');
        try {
            let parserRes = parser(source);
            
            let relativeDir=path.relative(dir,file);
            parserRes = formatParserRes(parserRes,relativeDir);
            const r = new Render(parserRes)
            const markdownRes = r.render();
            let pathJson=path.parse(relativeDir);
            let dirArr = pathJson.dir.split("/");
            let mdFile=path.join(docsDir,dirArr[0],"components",dirArr.slice(1,dirArr.length).join("/"),pathJson.name+".md");
            fs.ensureFileSync(mdFile);
            if(markdownRes){
                let componentName=`${pathJson.dir.split("/").join("-")}-${pathJson.name}`;
                if(!pathJson.dir){
                    componentName=`${pathJson.name}`;
                }
                
                let md=renderMarkdown(parserRes,markdownRes,componentName);
                fs.writeFileSync(mdFile,md);
            }
            
        } catch(e) {
            console.error(e)
        }
    }
}

function formatParserRes(parserRes,file){
    if(!parserRes.name){
        let name=path.parse(file).name
        if(name=="index"){
            name = path.basename(path.parse(file).dir)
        }
        parserRes.name=name;
    }
    if(parserRes.props){
        for(let i=0;i<parserRes.props.length;i++){
            let prop=parserRes.props[i];
            
            if(prop.typeDesc){
                
                try {
                    let values=prop.typeDesc[0];
                    
                    values=values.replace(/'/g,'\"');
                    values = JSON.parse(values);
                    if(values.length>0){
                        prop.values=values;
                    }
                    parserRes.props[i]=prop;
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
    return parserRes;
}

function renderMarkdown(parserRes,markdownRes,componentName){
    
    let md = `# ${parserRes.name}\n\n`;
    for(let key in parserRes.componentDesc){
        let val = parserRes.componentDesc[key];
        for(let i=0;i<val.length;i++){
            md += val[i]+'\n';
        }
    }
    let previewMD = '';
    md+=`## 预览\n\n`;

    
    for(let i =0;parserRes.props&&i<parserRes.props.length;i++){
        let prop=parserRes.props[i];
        if(prop.values){
            for(let j=0;j<prop.values.length;j++){
                let keyval="";
                let val=prop.values[j];
                if (typeof val === 'string' || val instanceof String){
                    keyval=`${prop.name}="${val}"`;
                }else{
                    keyval=`:${prop.name}="${val}"`;
                }
                previewMD+=`::: demo vue
                \n<${componentName} ${keyval}/>
                \n:::\n\n`;
            }
            
        }
    }
    if(!previewMD){
        md+=`::: demo vue
        \n<${componentName}/>
        \n:::\n\n`;
    }else{
        md+=previewMD;
    }
    for(let key in markdownRes){
        md +=`## ${key}\n\n`;
        md +=markdownRes[key];
    }
    return md;
    
}

