import deepcopy from 'deepcopy';
import { events } from './event';
import { onUnmounted } from 'vue'
export function useCommand(data, focusData) {
    const state = {
        current: -1,
        queue: [],
        commands: {},
        commandArray: [],
        destroyArray: []
    }

    const registry = (command) => {
            state.commandArray.push(command);
            state.commands[command.name] = (...args1) => {
                let { queue, current } = state;
                const { redo, undo, } = command.execute(...args1);
                redo();
                if (!command.pushQueue) {
                    return
                }

                if (queue.length > 0) {
                    queue = queue.slice(0, current + 1);
                    state.queue = queue;
                }
                queue.push({ redo, undo });

                state.current = current + 1;
            };
        }
        // 重做
    registry({
            name: 'redo',
            keyBoard: 'ctrl+y',
            execute() {
                return {
                    redo() {
                        // debugger
                        let item = state.queue[state.current + 1];
                        if (item) {
                            item.redo && item.redo();
                            state.current++;
                        }
                    }
                }
            }

        })
        // 撤销
    registry({
            name: 'undo',
            keyBoard: 'ctrl+z',
            execute() {
                return {
                    redo() {
                        if (state.current === -1) return;
                        let item = state.queue[state.current];
                        if (item) {
                            // debugger
                            item.undo && item.undo();
                            state.current--;
                        }
                    }
                }
            }

        })
        // 拖拽
    registry({
        name: 'drag',
        pushQueue: true,
        init() {
            this.before = null;
            const start = () => {
                this.before = deepcopy(data.value);
            }
            const end = () => {
                // debugger
                state.commands.drag();
            }
            events.on('start', start)
            events.on('end', end)
            return () => {
                events.off('start', start)
                events.off('end', end)
            }
        },
        execute() {
            let before = this.before;
            let after = data.value;
            // debugger
            return {
                redo() {
                    data.value = after;
                },
                undo() {
                    data.value = before;
                }
            }
        }
    });

    // 更新整个容器
    registry({
            name: 'updateContainer',
            pushQueue: true,
            execute(newVal) {
                let before = data.value;
                let after = newVal;
                // debugger
                return {
                    redo() {
                        data.value = after;

                    },
                    undo() {
                        data.value = before;
                    }
                }
            }
        })
        // 更新单个组件
    registry({
        name: 'updateBlock',
        pushQueue: true,
        execute(newBlock, oldBlock) {
            let before = deepcopy(data.value);
            let after = (() => {
                let newBlocks = [...data.value.blocks];
                const index = newBlocks.indexOf(oldBlock);
                if (index > -1) {
                    newBlocks.splice(index, 1, newBlock)
                }
                return newBlocks;
            })();
            // debugger
            return {
                redo() {
                    blocks.value = {...data.value, blocks: after };

                },
                undo() {
                    blocks.value = before;
                }
            }
        }
    })

    // 置顶
    registry({
        name: 'toTop',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value);
            let after = (() => {
                let maxZIndex = 0;
                let { focus, unfocused } = focusData.value;
                // 置顶就是在所有的未选中的block中找到最大的，然后选中的block都比最大的大1
                unfocused.forEach(block => {
                    if (block.zIndex > maxZIndex) {
                        maxZIndex = block.zIndex;
                    }
                })
                focus.forEach(block => {
                    block.zIndex = maxZIndex + 1;
                })
                return data.value;
            })();
            // debugger
            return {
                redo() {
                    data.value = after;
                },
                undo() {
                    data.value = before;
                }
            }
        }
    })

    // 置底
    registry({
        name: 'toBottom',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value);
            let after = (() => {
                let minZIndex = Infinity;
                let { focus, unfocused } = focusData.value;
                // 置底就是在所有的未选中的block中找到最小的，然后选中的block都比最大的大1
                unfocused.forEach(block => {
                    if (block.zIndex < minZIndex) {
                        minZIndex = block.zIndex;
                    }
                })
                minZIndex = minZIndex - 1;
                if (minZIndex < 0) {
                    const dur = Math.abs(minZIndex);
                    minZIndex = 0;
                    unfocused.forEach(block => block.zIndex += dur);
                }
                focus.forEach(block => {
                    block.zIndex = minZIndex;
                })
                return data.value;
            })();
            // debugger
            return {
                redo() {
                    data.value = after;
                },
                undo() {
                    data.value = before;
                }
            }
        }
    })

    // 删除
    registry({
        name: 'delete',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value);
            let after = focusData.value.unfocused
                // debugger
            return {
                redo() {
                    data.value = after;
                },
                undo() {
                    data.value = before;
                }
            }
        }
    })

    const keyBoardEvent = (() => {
        const keyCodes = {
            89: 'y',
            90: 'z'
        }
        const onkeydown = (e) => {
            const { ctrlKey, keyCode } = e;
            let keyString = [] // 用来存储按过的键
            if (ctrlKey) {
                keyString.push('ctrl');
            }
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');
            state.commandArray.forEach(({ name, keyBoard }) => {
                if (!keyBoard) return;
                if (keyBoard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })
        }
        const init = () => {
            document.addEventListener('keydown', onkeydown);
            return () => {
                window.removeEventListener('keydown', onkeydown);
            }
        }
        return init;
    })();

    (() => {
        state.destroyArray.push(keyBoardEvent())
        state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()));
    })()
    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn && fn());
    });
    return state;
}