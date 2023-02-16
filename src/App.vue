<template>
  <Editor v-model='state' :formData="formData"></Editor>
</template>

<script>
import { ref,provide, reactive, watch } from 'vue'
import Editor from './packages/editor.jsx'
import data from './data.json'
import {registerConfig as config}  from './util/editorConfig.jsx'
export default {
  name: 'App',
  components: {
    Editor
  },
  setup() {
    //为什么用reactive导致子组件更新不了state？？？ 暂时理解：对reactive代理的变量赋值会丢失原本的响应式，这里reactive和v-model一起用会导致丧失响应性
    let state = ref(data);
    provide("config", config);
    let formData = ref({
      username: 'aaa',
      password: 123456,
      start: 1,
      end: 100
    })
    return {
      state,
      formData
    }
  }
}
</script>

<style lang="scss">
.app{
  position:fixed;
  top:20px;
  left:20px;
  right:20px;
  bottom:20px;
}
</style>
