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