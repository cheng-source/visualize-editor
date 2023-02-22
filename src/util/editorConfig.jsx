import { Range } from '@/components/Range';
import {ElButton, ElInput, ElOption, ElSelect} from 'element-plus'

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
const createTable = (label, table) => ({type: 'table', label, table})
export let registerConfig = createEditorConfig();
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: ({props}) => <span style={{color: props.color, fontSize: props.size}}>{props.text || '渲染文本'}</span>,
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
  resize: {width: true},
  preview: () => <ElInput placeholder='预览输入框'></ElInput>,
  render: ({model, size}) => <ElInput placeholder='渲染输入框' {...model.default} style={{width: size.width + 'px'}}></ElInput>,
  key: 'input',
  model: {
    default: '绑定字段'
  }

});
registerConfig.register({
  label: '按钮',
  resize: {width: true, height: true},
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({props, size}) => <ElButton type={props.type} style={{width: size.width + 'px', height: size.height + 'px'}} size={props.size} >{ props.text || '渲染按钮'}</ElButton>,
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
      {label: '默认', value: ''},
      {label: '小', value: 'small'},
      {label: '中等', value: 'medium'},
      {label: '大', value: 'large'},
    ])
  }
});

registerConfig.register({
  label: '范围选择器',
  preview: () => <Range></Range>,
  render: ({model}) => <Range
                          start={model.start.modelValue} // @update:start
                          end={model.end.modelValue}
                          onUpdate:start={model.start['onUpdate:modelValue']}
                          onUpdate:end={model.end['onUpdate:modelValue']}
                      
                       ></Range>,
  key: 'range',
  model: {
    start: '开始',
    end: '结束'
  }
});

registerConfig.register({
  label: '下拉框',
  preview: () => <ElSelect></ElSelect>,
  render: ({props, model}) => {
    return <ElSelect {...model.default}>
      {
        (props.options || []).map((opt, index) => {
          return <ElOption label={opt.label} value={opt.value} key={index}></ElOption>
        })
      }
    </ElSelect>
  },
  key: 'select',
  props: {
    options: createTable('下拉选项',{
      options: [
        {label: '显示值', value: 'label'},
        {label: '绑定值', value: 'value'}
      ],
      key: 'label'
    })
  },
  model: {
    default: '绑定字段'
  }
});