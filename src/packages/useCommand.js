import deepcopy from 'deepcopy';
import { events } from './event';
import { onUnmounted } from 'vue'
export function useCommand(blocks) {
    const state = {
        current: -1,
        queue: [],
        commands: {},
        commandArray: [],
        destroyArray: []
    }

    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = () => {
            let { queue, current } = state;
            const { redo, undo, } = command.execute();
            // if (queue.length === 2) {
            //     queue.forEach(obj => obj.redo())
            // }
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
    registry({
        name: 'drag',
        pushQueue: true,
        init() {
            this.before = null;
            const start = () => {
                this.before = deepcopy(blocks.value);
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
            let after = blocks.value;
            console.log(blocks.value);
            console.log(after);
            // debugger
            return {
                redo() {
                    blocks.value = deepcopy(after);
                    // 下面这种写法的问题是：blocks指向的地址与after相同，之后修改blocks的值会影响after。
                    // blocks.value = after; 
                },
                undo() {
                    blocks.value = before;
                }
            }
        }
    });
    const keyBoardEvent = (() => {
        const keyCodes = {
            89: 'y',
            90: 'z'
        }
        const onkeydown = (e) => {
            const { ctrlKey, keyCode } = e;
            let keyString = [] // 用来存储按过的键
            if (ctrlKey) {
                // console.log(keyCode);
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
        // debugger
        console.log('a');
        state.destroyArray.push(keyBoardEvent())
        state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()));
    })()
    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn && fn());
    });
    return state;
}