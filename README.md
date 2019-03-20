# docsMaker 无感知文档生成器

> document maker tool for vue and markdown.

所谓无感知，即在你不知不觉中已经把文档生成。

## 支持的功能
* markdown解析
* demo预览自动生成
* vue组件代码自动生成
* 文档目录自动生成

## 安装
* node > 8.0
* 安装模块
``` sh
# 安装到全局，可通过命令行执行
tnpm install docsmaker -g
# 安装到项目
tnpm install docsmaker
```
## 配置
docsmaker适用于js项目，配置信息写入`package.json`文件里面的`docs`字段，示例以及配置说明如下，所有配置均非必填：
``` js
{
    ...
    "docs": {
        // 文档标题，默认为项目目录名
        "title":"文档生成工具",
        // 文档名字，当该项目为子项目时会作为目录，默认为项目目录名
        "name":"docsmaker",
        // 该项目下的文档所在目录，默认为['docs']
        "docs":["docsmaker"],
        // 该项目的主页，默认为"readme.md"
        "home":"readme.md",
        // 该项目所需要自动生成文档的vue组件目录，默认为[]
        "components":[],
        // 子项目的pattern，默认为""
        "subPatterns":"",
        // docsmaker使用vuepress构建文档，这里可以指定自定义的vuepress构建文件位置，默认为""
        "config":"",
        // 使用build模式生成的文档位置，默认为"docsmaker"
        "dest":"docs",
        "translate":{
            "components":"组件",
            "intro":"介绍",
            "example":"示例"
        }
    }
}
```


## 使用
命令行
```sh
# 调试模式
docsmaker
# 构建模式
docsmaker build
```
代码引用
``` js
const docsmaker = require("docsmaker");
// 调试模式
docsmaker.dev();
// 构建模式
docsmaker.build();
```
* 调试模式下，docsmaker会自动启动文档web服务，可以在浏览器直接访问，修改`docs`、`home`和`components`配置项所指定的文件会自动构建。
* 构建模式下，会在`dest`配置项所指定目录下构建出文档静态文件，直接在该目录启动web服务即可访问静态的文档页面，可以用来部署到服务器。

## markdown扩展功能

### markdown中直接使用vue组件
支持`components`配置项所指定目录下的所有vue组件在markdown中直接使用，比如该项目下，`components/docsmaker-button.vue`组件代码为：
``` vue
<template>
    <div class="ui-btn">{{text}}</div>
</template>
<script>
export default {
    props:{
        text:{
            // ["按钮","确定"]
            type:String,
            default:'按钮'
        }
    }
}
</script>

<style lang="scss" >
.ui-btn{
    width:60px;
    height:30px;
    line-height: 30px;
    font-size:14px;
    color:#000;
    text-align: center;
    border-radius: 6px;
    border:#bbb 1px solid;
    cursor: pointer;
    &:active{
        opacity: .5;
    }
}
</style>
```
在markdown中直接使用：
``` md
<docsmaker-button/>
```
效果如下：
<docsmaker-button/>

### demo预览功能

可以通过简单的格式，快速写好demo和代码的预览，并可以再codepen中预览
下面是markdown的写法

```md
::: demo html
<p class="common-html">
    this is <span style="color: red;">common</span> html
</p>
<style>
.common-html {
    color: green;
}
</style>
:::
```

::: demo html
<p class="common-html">
    this is <span style="color: red;">common</span> html
</p>

<style>
.common-html {
    color: green;
}
</style>
:::

还支持vue写法
```md
::: demo vue
<template>
    <button @click="onClick">Click me!</button>
</template>

<script>
export default {
    methods: {
        onClick: () => { window.alert(1) },
    },
}
</script>

<style>
button {
    color: blue;
}
</style>
:::
```
效果如下

::: demo vue

<template>
    <button @click="onClick">Click me!</button>
</template>

<script>
export default {
    methods: {
        onClick: () => { window.alert(1) },
    },
}
</script>

<style>
button {
    color: blue;
}
</style>

:::

### vue组件文档自动生成

使用[vuese](https://vuese.org/zh/parser/)自动生成`components`配置项指定的目录下vue组件的说明文档，并将demo呈现出来，带有`// ["status1","status2"]`注释的props会把改属性所有状态的组件显示出来，如前面提到的组件会生成这个文档：[components/docsmaker-button.vue](/components/docsmaker-button.html)

## 自动生成目录

文档目录下的一级目录会自动生成为顶部导航，二级以下目录会生成侧边导航，通过`translate`配置，可以将名字转换为中文，如本项目的文档目录为：
```
|- readme.md
|- intro
    |- readme.md
|- components
    |- docsmaker-button.md
```