
import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import {$tableDialog} from '../components/TableDialog'
import {defineComponent, computed} from "vue";

export default defineComponent({
  props: {
    propsConfig: {type: Object},
    modelValue: {type: Object}
  },
  emits: ['update:modelValue'],
  setup(props,ctx) {

    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue));
        console.log(data);
      }
    })

    const add = () => {
      $tableDialog({
        config: props.propsConfig,
        data: data.value,
        onConfirm(value) {
          data.value = value
        }
      })
    }
    
    return () => {
      return <div class="range">
          {(!data.value || data.value.length === 0) && <ElButton onClick={add}>添加</ElButton>}
          {(data.value || []).map(item => <ElTag onClick={add}>{item[props.propsConfig.table.key]}</ElTag>)}
      </div>
    }
  }
})
