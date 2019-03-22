#! /usr/bin/env node 

const program = require('commander');
const docsmarker = require("../index");
const path = require("path");
global.isBin=true;
global.modulePath=path.join(__dirname,"../node_modules");
program
  .version('1.0.0')
  .option('dev', 'dev mode')
  .option('build', 'build mode')
program.parse(process.argv);

if (program.build){
    docsmarker.build();
}else{
    docsmarker.dev();
}


