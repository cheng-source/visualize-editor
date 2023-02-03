<template>
  <Editor :data = state></Editor>
</template>

<script>
import { reactive,provide } from 'vue'
import Editor from './packages/editor.jsx'
import data from './data.json'
import {registerConfig as config}  from './util/editorConfig.jsx'
export default {
  name: 'App',
  components: {
    Editor
  },
  setup() {
    const state = reactive(data);
    provide("config", config)
    return {
      state
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
