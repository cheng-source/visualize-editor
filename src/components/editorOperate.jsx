import { defineComponent, inject, reactive, watch } from "vue";
import { ElButton, ElForm, ElFormItem , ElInput, ElInputNumber, ElColorPicker, ElSelect, ElOption } from "element-plus";
import TableEditor from '../packages/TableEditor'
import deepcopy from "deepcopy";

export const EditorOperate = defineComponent({
  props:{
    block: {type:Object},
    data: {type: Object},
    updateContainer: {type: Function},
    updateBlock: {type: Function}
  },
  setup(props) {
    const config = inject('config');
    const state = reactive({
      editData: {}
    });

    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data.container)
      } else {
        state.editData = deepcopy(props.block);
      }
    }

    const apply = () => {
      if (!props.block) {
        props.updateContainer({...props.data, container: state.editData});
      } else {
        props.updateBlock(state.editData, props.block);
      }
    }

    watch(() => props.block, reset, {immediate: true});

    return () => {
      let content = [];
      if (!props.block) {
        content.push(<>
          <ElFormItem label='容器宽度'>
            <ElInputNumber v-model={state.editData.width}></ElInputNumber>
          </ElFormItem>
          <ElFormItem label='容器高度'>
            <ElInputNumber v-model={state.editData.height}></ElInputNumber>
          </ElFormItem>
          </>
        )
      } else {
        let component = config.editorConfigMap.get(props.block.key);
        if (component && component.props) {
          content.push(Object.entries(component.props).map(([propName, propConfig]) => {
            return <ElFormItem label={propConfig.label}>
              {{
              input: () => <ElInput v-model={state.editData.props[propName]} ></ElInput>,
              color: () => <ElColorPicker v-model={state.editData.props[propName]} ></ElColorPicker>,
              select: () => <ElSelect v-model={state.editData.props[propName]} >
                {propConfig.options.map(opt => {
                  return <ElOption label={opt.label} value={opt.value}></ElOption>
                })}
              </ElSelect>,
              table: () => <TableEditor propsConfig={propConfig} v-model={state.editData.props[propName]}></TableEditor>

            }[propConfig.type]()}
            </ElFormItem>
          } ))
        }
        if (component && component.model) {
          content.push(Object.entries(component.model).map(([modelName, label]) => {
            return <ElFormItem label={label}>
            <ElInput v-model={state.editData.model[modelName]} ></ElInput>
          </ElFormItem>
          }))
        }
      }
      return <ElForm labelPosition="top" >
      {content}
      <ElFormItem>
        <ElButton type='primary' onClick={() => apply()}>应用</ElButton>
        <ElButton>重置</ElButton>
      </ElFormItem>

    </ElForm>
  }
}
})