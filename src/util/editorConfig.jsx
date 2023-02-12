import {ElButton, ElInput} from 'element-plus'
function createEditorConfig() {
  let editorConfigList = [];
  let editorConfigMap = new Map();

  return {
    editorConfigList,
    editorConfigMap,
    register(component) {
      editorConfigList.push(component);
      editorConfigMap.set(component.key, component);
    }
  }
}
const createInput = (label) => ({type: 'input', label})
const createColor = (label) => ({type: 'color', label})
const createSelect = (label, options) => ({type: 'select', label, options})
export let registerConfig = createEditorConfig();
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text',
  props: {
    text: createInput('文本内容'),
    color: createColor('字体颜色'),
    size: createSelect('字体大小',[
      {label: '14px', value: '14px'},
      {label: '18px', value: '18px'},
      {label: '22px', value: '22px'},
    ])
  }
});
registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder='预览输入框'></ElInput>,
  render: () => <ElInput placeholder='渲染输入框'></ElInput>,
  key: 'input',
  props: {
    text: createInput('绑定字段'),
  }

});
registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: 'button',
  props: {
    text: createInput('input', '按钮内容'),
    type: createSelect('按钮类型', [
      {label: '基础', value: 'primary'},
      {label: '成功', value: 'success'},
      {label: '警告', value: 'warning'},
      {label: '危险', value: 'danger'},
      {label: '信息', value: 'info'},
    ]),
    size: createSelect('按钮大小',[
      {label: '14px', value: '14px'},
      {label: '18px', value: '18px'},
      {label: '22px', value: '22px'},
    ])
  }
});