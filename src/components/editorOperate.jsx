import { defineComponent, inject } from "vue";
import { ElButton, ElForm, ElFormItem , ElInput, ElInputNumber, ElColorPicker, ElSelect, ElOption } from "element-plus";

export const EditorOperate = defineComponent({
  props:{
    block: {type:Object}
  },
  setup(props) {
    

    const config = inject('config');


    return () => {
      let content = [];
      console.log(props.block);
      if (!props.block) {
        content.push(<>
          <ElFormItem label='容器宽度'>
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
          <ElFormItem label='容器高度'>
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
          </>
        )
      } else {
        let component = config.editorConfigMap.get(props.block.key);
        console.log(props.block.key, config.editorConfigMap.get(props.block.key));
        if (component && component.props) {

          content.push(Object.entries(component.props).map(([propName, propConfig]) => {
            return <ElFormItem label={propConfig.label}>
              {{
              input: () => <ElInput class='aaa'></ElInput>,
              color: () => <ElColorPicker></ElColorPicker>,
              select: () => <ElSelect>
                {propConfig.options.map(opt => {
                  return <ElOption label={opt.label} value={opt.value}></ElOption>
                })}
              </ElSelect>
            }[propConfig.type]()}
            </ElFormItem>
          } ))
        }
      }
      return <ElForm labelPosition="top" >
      {content}
      <ElFormItem>
        <ElButton type='primary'>应用</ElButton>
        <ElButton>重置</ElButton>
      </ElFormItem>

    </ElForm>
  }
}
})