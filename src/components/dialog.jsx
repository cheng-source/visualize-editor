import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, render,ref, reactive } from "vue";

const DialogComponent = defineComponent({
  props: {
    options: {type: Object}
  },
  setup(props, ctx) {
    let state = reactive({
      isShow: true,
      options: props.options
    });
    ctx.expose({
      showDialog(options) {
        state.isShow = true,
        state.options = options
      }
    })
    const confirm = () => {
      state.isShow = false;
      state.options.onConfirm && state.options.onConfirm(state.options.content)
    }
    return () => {
      return <ElDialog  v-model={state.isShow} title = {state.options.title}>
        {{
          default: () => <ElInput
           type='textarea'
            v-model={state.options.content}
             row={10}
             ></ElInput>,
          footer: () => 
            state.options.footer &&  <div>
              <ElButton onClick={()=> {state.isShow = false}}>取消</ElButton>
              <ElButton type="primary" onClick={confirm} >确定</ElButton>
              </div>
        }}
      </ElDialog>
      // return <ElInput class='dsfaas' type='textarea' v-model={state.options.content} row={10}  placeholder="Please input"></ElInput>
    }
  }
})

let vm = null;
export function $Dialog(options) {
  // 防止产生多个对话框
  if (!vm) {
    const el = document.createElement('div');
    el.className = 'dialog_div'
    vm = createVNode(DialogComponent,{options});
    
    document.body.appendChild((render(vm,el),el)); 
  }
  vm.component.exposed.showDialog(options);
  
}