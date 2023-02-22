import { defineComponent } from "vue";

export default defineComponent({
  props: {
    block: {type: Object},
    component: {type: Object}
  },
  setup(props) {
    const {width, height} = props.component.resize || {};
    let data = null;
    const mousemove = (e) => {  
      let {clientX, clientY} = e;
      let {startX, startY, startWidth, startHeight, startLeft, startTop, direction} = data;

      // 如果拖拽的是上下的中间点。则宽度不能变
      if (direction.x === 'center') {
        clientX = startX;
      }
      // 如果拖拽的是左右的中间点，则高度不能变
      if (direction.y === 'center') {
        clientY = startY;
      }

      let durX = clientX - startX;
      let durY = clientY - startY;
      // 如果拖拽的是左边的点
      if (direction.x === 'start') {
        durX = -durX;
        props.block.left = startLeft - durX;
      }

      if (direction.y === 'start') {
        durY = -durY;
        props.block.top = startTop - durY;
      }
      const width = startWidth + durX;
      const height = startHeight + durY;
      props.block.hasResize = true;
      props.block.width = width;
      props.block.height = height;
    }
    const mouseup = (e) => {
      // 不能给事件函数添加参数
      document.body.removeEventListener('mousemove', mousemove);
      document.body.removeEventListener('mouseup', mouseup);
    }
    const mousedown = (e, direction) => {
      // debugger
      e.stopPropagation();
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width, 
        startHeight: props.block.height,
        startLeft: props.block.left,
        startRight: props.block.right,
        direction
      }
      document.body.addEventListener('mousemove', mousemove);
      document.body.addEventListener('mouseup', mouseup)
    }
    return () => <>
      {
        width && <> 
          <div class="block-resize resize-left"  onMousedown={(e) => mousedown(e, {x: 'start' ,y: 'center' })}></div>
          <div class="block-resize resize-right"  onMousedown={(e) => mousedown(e, {x: 'end' ,y: 'center' })}></div>
        </>
      }
      {
        height && <> 
          <div class="block-resize resize-top"  onMousedown={(e) => mousedown(e, {x: 'center' ,y: 'start' })}></div>
          <div class="block-resize resize-bottom"  onMousedown={(e) => mousedown(e, {x: 'center' ,y: 'end' })}></div>
        </>
      }
      {
        width && height && <> 
          <div class="block-resize resize-top-left"  onMousedown={(e) => mousedown(e, {x: 'start' ,y: 'start' })}></div>
          <div class="block-resize resize-top-right"  onMousedown={(e) => mousedown(e, {x: 'end' ,y: 'start' })}></div>
          <div class="block-resize resize-bottom-left"  onMousedown={(e) => mousedown(e, {x: 'start' ,y: 'end' })}></div>
          <div class="block-resize resize-bottom-right"  onMousedown={(e) => mousedown(e, {x: 'end' ,y: 'end' })}></div>
        </>
      }
    </>
  }
})