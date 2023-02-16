import {defineComponent, inject } from "vue";

export const MenuItem = defineComponent({
  props: {
    label: {type: String},
    icon: {type: String}
  },
  setup(props) {
    let hide = inject('hide');
    return () => {
      return <div class='menuItem' onClick={hide}>
         <i class={props.icon}></i>
         <span>{props.label}</span>
      </div>
    }
  }
})