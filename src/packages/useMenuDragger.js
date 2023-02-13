import { events } from "./event";

// 封装拖拽函数
export function useMenuDragger(containerRef, data) {
    let currentComponent = null;

    const dragenter = (e) => {
        e.dataTransfer.dropEffect = 'move'
    };
    const dragover = (e) => {
        // 阻止默认行为使放置目标可以放置
        e.preventDefault();
    };
    const dragleave = (e) => {
        // e.dataTransfer.dropEffect = 'none'

    };
    const drop = (e) => {
        // 内部已经渲染的组件
        let blocks = data.value.blocks;
        // 拖拽结束后添加一个组件
        data.value = {
            ...data.value,
            blocks: [
                ...blocks,
                {
                    top: e.offsetY,
                    left: e.offsetX,
                    zIndex: 1,
                    key: currentComponent.key,
                    alignCenter: true, // 拖拽的组件的标识，用来在拖拽到目标元素上后使拖拽元素以鼠标为中心
                }
            ]
        };
        currentComponent = null;
    };

    const dragStart = (e, component) => {

        e.dataTransfer.effectAllowed = 'move';
        containerRef.value.addEventListener('dragenter', dragenter);
        containerRef.value.addEventListener('dragover', dragover);
        containerRef.value.addEventListener('dragleave', dragleave);
        containerRef.value.addEventListener('drop', drop);
        currentComponent = component;
        events.emit('start');

    };
    const dragend = (e) => {
        // 拖拽完后需要移除事件
        containerRef.value.removeEventListener('dragenter', dragenter);
        containerRef.value.removeEventListener('dragover', dragover);
        containerRef.value.removeEventListener('dragleave', dragleave);
        containerRef.value.removeEventListener('drop', drop);
        events.emit('end');
    }
    return {
        dragStart,
        dragend
    }
}