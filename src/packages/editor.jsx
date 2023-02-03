import {computed, defineComponent, inject, onMounted, ref} from 'vue';
import './editor.scss';
import EditorBlock from './editor-block'
import { useMenuDragger } from './useMenuDragger';
import { useFocus } from './useFocus';
import { useBlockDragger } from './useBlockDragger';
import { useCommand } from './useCommand';
import {$Dialog} from '../components/dialog'
export default defineComponent({
  props: {
    data: {type: Object}
  },
  setup(props) {
    // const data = computed({
    //   get() {
    //     props.data
    //   }
    // })
    // console.log(props.data);
    const blocks = computed({
      get() {
        return props.data.blocks
      },
      set(newVal) {
        props.data.blocks = newVal
      }
    })
    let containerStyle = computed(() => {
      return {
        width: props.data.container.width + 'px',
        height: props.data.container.height + 'px'
      }
    });

    const config = inject("config");

    const containerRef = ref(null);

    // 左侧菜单组件的拖拽
    const {dragStart,dragend} = useMenuDragger(containerRef,blocks);

    

    const {blockMousedown,clearFocus,focusData, lastSelectBlock} = useFocus(blocks, (e) => {
      mousedown(e)
    })

    // 内容区组件的拖拽
    const {mousedown, markLine} = useBlockDragger(focusData, lastSelectBlock, props.data);

    const containerMousedown = () => {
      clearFocus();
    }
    let commands = useCommand(blocks);
  
    let buttons = [
      {label: '撤销', icon: 'iconfont icon-undo', handler: commands.commands.undo},
      {label: '重做', icon: 'iconfont icon-redo', handler: commands.commands.redo},
      {label: '导入', icon: 'iconfont icon-Import', handler: ()=> {
        $Dialog({
          title: '导入',
          content: '',
          footer: true,
          onConfirm: (text)=> {
            // console.log(text)
            // blocks.value = JSON.parse(text) // 这样写没法撤销前进
            commands.commands.updateBlocks(JSON.parse(text))
          }
        })
      }},
      {label: '导出', icon: 'iconfont icon-export', handler: ()=> {        
        $Dialog({
          title: '导出',
          content: JSON.stringify(blocks.value),
          
        })
      }},
    ];

    return () => <div class="editor">
                      {/* 左侧物料区 */}
                      <div class="editor-left">
                          {
                            config.editorConfigList.map(component => (
                              <div 
                                class="editor-left-item" 
                                draggable 
                                ondragstart={e => dragStart(e, component)}
                                ondragend = {dragend}
                                >
                                <span>{component.label}</span>
                                <div>{component.preview()}</div>
                              </div>
                            ))
                          }
                      </div>
                      {/* 顶部菜单栏 */}
                      <div class="editor-top">
                        
                        {buttons.map(btn => {
                          return <div class="editor-top-button" onClick={btn.handler}>
                            <i class={btn.icon}></i>
                            <span>{btn.label}</span>
                          </div>
                        })}
                      </div>
                      <div class="editor-right"></div>
                      <div class="editor-container">
                          {/* 产生滚动条 */}
                          <div class="editor-container-canvas">
                            {/* 产生内容区域 */}
                            <div 
                            id="content" 
                            class="editor-container-canvas-content" 
                            style={containerStyle.value} 
                            ref={containerRef}
                            onMousedown={containerMousedown}
                            >
                              {
                                (blocks.value.map((block,index) => (
                                  <EditorBlock 
                                  class = {block.focus ? 'block-focus' : ''}
                                  block = {block}
                                  onMousedown = {(e)=> blockMousedown(e, block, index)}
                                  ></EditorBlock>
                                )))
                              }
                              {markLine.x !== null && <div class="line-x" style={{left: markLine.x + 'px'}}></div>}
                              {markLine.y !== null && <div class="line-y" style={{top: markLine.y + 'px'}}></div>}
                            </div>
                          </div>
                      </div>
                  </div>
  }
}) 
