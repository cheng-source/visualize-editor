import {computed, defineComponent, inject, ref,onMounted, watch} from 'vue';
export default defineComponent({
  props: {
    block: {type: Object},
    formData: {type: Object}
  },
  setup(props) {
    const blockStyle = computed(()=>({
      left: props.block.left + 'px',
      top: props.block.top + 'px',
      zIndex: props.block.zIndex
    }));

    const config = inject("config");

    const blockRef = ref(null);
    onMounted(()=> {
      let {offsetWidth, offsetHeight} = blockRef.value;
      if (props.block.alignCenter) {
        // 拖拽到目标元素上后使拖拽元素以鼠标为中心
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2;
        props.block.alignCenter = false;
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    })
    const component = config.editorConfigMap.get(props.block.key);
    return ()=> 
    <div class="editor-block" style={blockStyle.value} ref={blockRef}>
        {config.editorConfigMap.get(props.block.key).render({
          props: props.block.props,
          // model: props.block.model  => {default:'username'}  => {modelValue: FormData.username,"onUpdate:modelValue":v=> FormData.username = v}
          // model: {
          //   default: '绑定字段'
          // }
          // modelName = default
          // prev[default] = {modelValue: aaa, }
          model: Object.keys(component.model || {}).reduce((prev, modelName) => {
            let propName = props.block.model[modelName];
            prev[modelName] = {
              modelValue: props.formData[propName],
              "onUpdate:modelValue": v => props.formData[propName] = v
            }
            return prev
          }, {})
        })}
    </div>
  }
}) 
