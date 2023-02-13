import { computed, reactive, ref, watch } from 'vue';
export function useFocus(data, preViewRef, callback) {
    // 获取哪些元素被选中
    const focusData = computed(() => {
        let focus = [];
        let unfocused = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
        return { focus, unfocused }
    })

    let selectIndex = ref(-1);

    // 最后选中的元素
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
    watch(lastSelectBlock, () => {
            console.log(lastSelectBlock.value);
        })
        // 清空选中的元素
    const clearFocus = () => {
        data.value.blocks.forEach(block => block.focus = false);
    }

    const containerMousedown = () => {
        if (preViewRef.value) return;
        clearFocus();
        selectIndex.value = -1;
    }

    const blockMousedown = (e, block, index) => {
        if (preViewRef.value) return;
        e.preventDefault();
        e.stopPropagation();
        // 按住shift键可以连续选中
        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true;
            } else {
                block.focus = !block.focus;
            }

        } else {
            if (!block.focus) {
                //选中其它组件时取消原来选中的组件
                clearFocus();
                block.focus = true;
            }
        }
        selectIndex.value = index
        callback(e);
    }
    return {
        blockMousedown,
        clearFocus,
        focusData,
        lastSelectBlock,
        containerMousedown
    }
}