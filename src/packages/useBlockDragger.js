import { reactive } from 'vue'
export function useBlockDragger(focusData, lastSelectBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0
    }
    let markLine = reactive({
        x: null,
        y: null
    })

    const mousemove = (e) => {
        let { clientX: moveToX, clientY: moveToY } = e;
        // 计算最后一个元素的left和top
        const lastBlockLeft = moveToX - dragState.startX + dragState.lastStartLeft;
        const lastBlockTop = moveToY - dragState.startY + dragState.lastStartTop;
        let y = null,
            x = null;
        for (let i = 0; i < dragState.lines().y.length; i++) {
            const { lineTop, BShouldTop } = dragState.lines().y[i];
            if (Math.abs(lastBlockTop - BShouldTop) < 5) {
                y = lineTop;
                // 实现快速和A元素贴近
                moveToY = BShouldTop - dragState.lastStartTop + dragState.startY;
                break;
            }
        }

        for (let i = 0; i < dragState.lines().x.length; i++) {
            const { lineLeft, BShouldLeft } = dragState.lines().x[i];
            if (Math.abs(lastBlockLeft - BShouldLeft) < 5) {
                x = lineLeft;
                // 实现快速和A元素贴近
                moveToX = BShouldLeft - dragState.lastStartLeft + dragState.startX;
                break;
            }
        }

        markLine.x = x; // markLine是一个响应式数据
        markLine.y = y;


        const moveX = moveToX - dragState.startX, // 拖拽的距离
            moveY = moveToY - dragState.startY;
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.startPos[idx].top + moveY;
            block.left = dragState.startPos[idx].left + moveX;
        })
    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        markLine.x = null;
        markLine.y = null;
    }

    const mousedown = (e) => {
        const { width: BWidth, height: BHeight } = lastSelectBlock.value
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            lastStartLeft: lastSelectBlock.value.left,
            lastStartTop: lastSelectBlock.value.top,
            startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            // 获取辅助线
            lines: () => {
                let line = { x: [], y: [] };

                [
                    ...focusData.value.unfocused,
                    { top: 0, left: 0, width: data.container.width, height: data.container.height }
                ].forEach((ABlock) => {

                    const { top: Atop, left: ALeft, width: AWidth, height: AHeight } = ABlock

                    line.y.push({ lineTop: Atop, BShouldTop: Atop - BHeight })
                    line.y.push({ lineTop: Atop, BShouldTop: Atop })
                    line.y.push({ lineTop: Atop + AHeight / 2, BShouldTop: Atop + AHeight / 2 - BHeight / 2 })
                    line.y.push({ lineTop: Atop + AHeight, BShouldTop: Atop + AHeight - BHeight })
                    line.y.push({ lineTop: Atop + AHeight, BShouldTop: Atop + AHeight })

                    line.x.push({ lineLeft: ALeft, BShouldLeft: ALeft - BWidth })
                    line.x.push({ lineLeft: ALeft, BShouldLeft: ALeft })
                    line.x.push({ lineLeft: ALeft + AWidth / 2, BShouldLeft: ALeft + AWidth / 2 - BWidth / 2 })
                    line.x.push({ lineLeft: ALeft + AWidth, BShouldLeft: ALeft + AWidth - BWidth })
                    line.x.push({ lineLeft: ALeft + AWidth, BShouldLeft: ALeft + AWidth })
                })
                return line;
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    return {
        mousedown,
        markLine
    }
}