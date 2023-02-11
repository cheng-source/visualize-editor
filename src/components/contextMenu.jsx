import { createVNode, defineComponent, render,ref, reactive, computed, onMounted, onUnmounted, provide } from "vue";


const MenuComponent = defineComponent({
  props: {
    options: {type: Object}
  },
  setup(props, ctx) {
    let state = reactive({
      isShow: true,
      options: props.options,
      top: 0,
      left: 0
    });
    ctx.expose({
      showDropdown(options) {
        state.isShow = true;
        state.options = options;
        let {top, left, height} = options.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      }
    })
    // 组件的引用
    const el = ref(null);
    const onMousedownDocument = (e) => {
      // 点击非菜单的地方则隐藏菜单
      if (!(el.value.contains(e.target))) {
        state.isShow = false;
      }
    }
    onMounted(() => {
      document.addEventListener('mousedown',onMousedownDocument,true);
    })
    onUnmounted(() => {
      document.removeEventListener('mousedown',onMousedownDocument);
    })

    provide('hide', ()=> state.isShow = false);
    
    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])

    const styles = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px'
    }))
    // const confirm = () => {
    //   state.isShow = false;
    //   state.options.onConfirm && state.options.onConfirm(state.options.content)
    // }
    return () => {
      return <div class = {classes.value} style = {styles.value} ref={el}>
         {state.options.content()}
      </div>
    }
  }
})

let vm = null;
export function $dropdown(options) {
  // 防止产生多个对话框
  if (!vm) {
    const el = document.createElement('div');
    // 创建虚拟节点
    // console.log(MenuComponent);
    vm = createVNode(MenuComponent,{options});
    // render(vm,document.body)
    // 渲染虚拟节点并挂载
    document.body.appendChild((render(vm,el),el)); 
  }
  console.log(options.content());
  vm.component.exposed.showDropdown(options);
}