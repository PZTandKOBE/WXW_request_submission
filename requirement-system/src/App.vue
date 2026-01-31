<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
// 引入 Element Plus 的中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const locale = ref(zhCn)
</script>

<style>
/* 全局样式重置：确保 html 和 body 占满全屏 */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5; /* 统一背景色 */
}

/* 覆盖 Element Plus 的一些默认行为（可选） */
* {
  box-sizing: border-box;
}
</style>