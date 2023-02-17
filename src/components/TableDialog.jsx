import deepcopy from "deepcopy";
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus";
import { createVNode, defineComponent, render,ref, reactive } from "vue";

const TableDialogComponent = defineComponent({
  props: {
    options: {type: Object}
  },
  setup(props, ctx) {
    let state = reactive({
      isShow: true,
      options: props.options,
      editData: []
    });
    ctx.expose({
      show(options) {
        state.isShow = true,
        state.options = options,
        state.editData = deepcopy(options.data);
      }
    })
    const add = () => {
      state.editData.push({})
    }
    const onConfirm = () => {
      state.isShow = false;
      debugger
      state.options.onConfirm && state.options.onConfirm(state.editData)
    }
    return () => {
      return <ElDialog  v-model={state.isShow} title = {state.options.config.label}>
        {{
          default: () => (
            <div>
              <div><ElButton onClick={add}>添加</ElButton><ElButton>重置</ElButton></div>
              <ElTable data={state.editData}>
                <ElTableColumn type="index"></ElTableColumn>
                {state.options.config.table.options.map(item => {
                  return <ElTableColumn label={item.label}>
                    {/* vue3插槽是一个函数 */}
                    {{
                      default: ({row}) => <ElInput v-model={row[item.value]}></ElInput>
                    }}
                  </ElTableColumn>
                })}
                <ElTableColumn label="操作">
                  <ElButton type="danger">删除</ElButton>
                </ElTableColumn>
              </ElTable>
            </div>
          ),
          footer: () => 
            <div>
              <ElButton onClick={()=> {state.isShow = false}}>取消</ElButton>
              <ElButton type="primary" onClick={onConfirm} >确定</ElButton>
              </div>
        }}
      </ElDialog>
      // return <ElInput class='dsfaas' type='textarea' v-model={state.options.content} row={10}  placeholder="Please input"></ElInput>
    }
  }
})

let vm = null;
export function $tableDialog(options) {
  // 防止产生多个对话框
  if (!vm) {
    const el = document.createElement('div');
    vm = createVNode(TableDialogComponent,{options});
    document.body.appendChild((render(vm,el),el)); 
  }
  vm.component.exposed.show(options);
  
}