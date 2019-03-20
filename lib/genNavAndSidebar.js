const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const globby = require("globby");
let navFile=".vuepress/navAndSidebar.json";
module.exports=async function genNavAndSidebar(docsDir,options){
    console.log("正在生成目录...")
    let files = await globby([path.join(docsDir,'**/*.md'),path.join(docsDir,'*.md'),"!.vuepress"]);
    let config={nav:[],sidebar:{}};
    let indexPages=["readme","index"];
    
    for(let i=0;i<files.length;i++){
        let file=path.relative(docsDir,files[i]);
        let fileParser=path.parse(file);
        let dirs = file.split("/");
        if(dirs.length>1){
            let link = `/${fileParser.dir}/`;
            if(_.indexOf(indexPages,fileParser.name.toLowerCase())<0){
                link+=fileParser.name;
            }
            let j=_.findIndex(config.nav, {name:dirs[0]});
            if(j>=0){
                if(config.nav[j].link.split("/").length>link.split("/").length){
                    config.nav[j].link=link;
                    break;
                }
            }else{
                let projectIndex=_.findIndex(options.subProjects, {name:dirs[0]});
                let name = dirs[0];
                if(projectIndex>=0){
                    name = options.subProjects[projectIndex].nam;
                    // config.nav.push({text:options.subProjects[projectIndex].name,link:link,name:dirs[0]})
                }
                if(options.translate[name]){
                    name = options.translate[name];
                }
                config.nav.push({text:name,link:link,name:dirs[0]})
            }
        }else{
            
            if(_.indexOf(indexPages,fileParser.name.toLowerCase())>=0){
                config.nav.push({text:"首页",link:`/`})
            }
            
        }
        if(dirs.length==2){
            let nav=_.find(config.nav, {name:dirs[0]});
            
            if(nav){
                let link=fileParser.name;
                if(_.indexOf(indexPages,fileParser.name.toLowerCase())<0){
                
                    if(config.sidebar[nav.link]){
                        config.sidebar[nav.link].push(link)
                    }else{
                        config.sidebar[nav.link]=[link];
                    }
                }
                
            }
            
        }else if(dirs.length>2){
            let nav=_.find(config.nav, {name:dirs[0]});
            if(nav){
                let name = fileParser.name;
                if(_.indexOf(indexPages,fileParser.name.toLowerCase())>=0){
                    name=""
                }
                let link=path.relative(dirs[0],path.join(fileParser.dir))+"/"+name;
                let title = dirs[1];
                if(options.translate[title]){
                    title = options.translate[title];
                }
                let group={
                    title: title,
                    collapsable: true,
                    children: [
                        link
                    ]
                };
                let index=_.findIndex(config.sidebar[nav.link], {title:title});
                if(index>=0){
                    config.sidebar[nav.link][index].children.push(link);
                }else if(!config.sidebar[nav.link]){
                    
                    config.sidebar[nav.link]=[group];
                }else{
                    config.sidebar[nav.link].push(group);
                }
                
            }
        }
    }
    config.options=options;
    fs.ensureFileSync(path.join(docsDir,navFile));
    fs.writeFileSync(path.join(docsDir,navFile),JSON.stringify(config));
}