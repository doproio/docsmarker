<template>
    <div :class="['ui-btn','ui-btn-'+type]">{{text}}</div>
</template>
<script>
// @example {"type":"text","text":"按钮"}
// @example {"type":"defalut","text":"确定"}
// 带@example前缀的为示例代码，必须为json格式（比如{"type":"text","text":"按钮"}），会罗列所有example的props键值对到demo示意里面，如果没有example，则会从将所有props的默认值（第一个）中提出来展示
export default {
    props: {
        
        text: {
            // "按钮" / "确定"
            type: String,
            default: '按钮',
        },
        type: {
            // "text" / "default" 
            type: String,
            default: 'text',
        },
    },
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
.ui-btn-text{
    border-color:rgba(0,0,0,0)
}
</style>