import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue';
import './editor.scss';
import EditorBlock from './editor-block'
import { useMenuDragger } from './useMenuDragger';
import { useFocus } from './useFocus';
import { useBlockDragger } from './useBlockDragger';
import { useCommand } from './useCommand';
import {$Dialog} from '../components/dialog';
import {$dropdown} from '../components/contextMenu'
import {MenuItem} from '../components/menuItem'
import {EditorOperate} from '../components/editorOperate'
import { ElButton} from "element-plus";
import deepcopy from 'deepcopy';

export default defineComponent({
  props: {
    modelValue: {type: Object},
    formData: {type: Object}
  },
  emits: ['update:modelValue'],
  setup(props,ctx) {
    let preViewRef = ref(false); //预览标志
    let closeRef = ref(false);
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newVal) {
        // props中的属性是只读的
        // props.data = newVal
        ctx.emit('update:modelValue', deepcopy(newVal));
      }
    });

    let containerStyle = computed(() => {
      return {
        width: data.value.container.width + 'px',
        height: data.value.container.height + 'px'
      }
    });

    console.log(props.formData);
    const config = inject("config");

    const containerRef = ref(null);

    // 左侧菜单组件的拖拽
    const {dragStart,dragend} = useMenuDragger(containerRef, data);

    
    // 获取焦点
    const {blockMousedown,clearFocus,focusData, lastSelectBlock, containerMousedown} = useFocus(data,preViewRef, (e) => {
      mousedown(e)
    })

    // 内容区组件的拖拽
    const {mousedown, markLine} = useBlockDragger(focusData, lastSelectBlock, data);


    let commands = useCommand(data, focusData);
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
            // debugger
            commands.commands.updateContainer(JSON.parse(text))
          }
        })
      }},
      {label: '导出', icon: 'iconfont icon-export', handler: ()=> {        
        $Dialog({
          title: '导出',
          content: JSON.stringify(data.value),
        })
      }},
      {label: '置顶', icon: 'iconfont icon-top', handler: commands.commands.toTop},
      {label: '置底', icon: 'iconfont icon-bottom', handler: commands.commands.toBottom},
      {label: '删除', icon: 'iconfont icon-delete', handler: commands.commands.delete},
      {label: () => preViewRef.value ? '编辑': '预览', icon: () => preViewRef.value ?  'iconfont icon-edit' : 'iconfont icon-preview', handler: () => {
        preViewRef.value = !preViewRef.value;
        clearFocus();
      }},
      {label: '关闭', icon: 'iconfont icon-close', handler: () => {
        closeRef.value = !closeRef.value
        clearFocus();
      }},
    ];

    let contextmenuBlock = (e,block) => {
      e.preventDefault();
      $dropdown({
        el: e.target,
        content: () => {
          return <>
          <MenuItem label='置顶' icon='iconfont icon-top' onClick = {commands.commands.toTop}></MenuItem>
          <MenuItem label='置底' icon='iconfont icon-bottom' onClick = {commands.commands.toBottom}></MenuItem>
          <MenuItem label='删除' icon='iconfont icon-delete' onClick = {commands.commands.delete}></MenuItem>
          <MenuItem label='导入' icon='iconfont icon-Import' onClick = {() =>
                    $Dialog({
                      title: '导入',
                      content: '',
                      footer: true,
                      onConfirm: (text)=> {
                        debugger
                        commands.commands.updateBlock(JSON.parse(text),block)
                      }
                    })
          }></MenuItem>
          <MenuItem label='导出' icon='iconfont icon-Import' onClick = {() =>
                    $Dialog({
                      title: '导出',
                      content: JSON.stringify(block),
                    })
          }></MenuItem>
          </>
        }
      })
    }

    return () => closeRef.value ? <>           
                     <div 
                     id="content" 
                     class="editor-container-canvas-content" 
                     style={containerStyle.value} 
                     ref={containerRef}
                     onMousedown={containerMousedown}
                     >
                       {
                         (data.value.blocks.map((block,index) => (
                           <EditorBlock 
                           class = {block.focus ? 'block-focus' : ''}
                           class = {preViewRef.value ? 'block-editing' : ''} // 为什么能覆盖editor-block的::after样式?
                           block = {block}
                           onMousedown = {(e)=> blockMousedown(e, block, index)}
                           formData = {props.formData}
                           ></EditorBlock>
                         )))
                       }
                       {markLine.x !== null && <div class="line-x" style={{left: markLine.x + 'px'}}></div>}
                       {markLine.y !== null && <div class="line-y" style={{top: markLine.y + 'px'}}></div>}
                    </div>
                     <div ><ElButton  onClick={() => {closeRef.value = false}}>继续编辑</ElButton></div>
                     {JSON.stringify(props.formData)}
                     </>

                    :

                    <div class="editor">
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
                          let icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon;
                          let label = typeof btn.label === 'function' ? btn.label() : btn.label;
                          return <div class="editor-top-button" onClick={btn.handler}>
                            <i class={icon}></i>
                            <span>{label}</span>
                          </div>
                        })}
                      </div>
                      {/* 右侧 */}
                      <div class="editor-right">
                        <EditorOperate
                         block={lastSelectBlock.value} 
                         data={data.value} 
                         updateContainer={commands.commands.updateContainer} 
                         updateBlock = {commands.commands.updateBlock}
                         ></EditorOperate>
                      </div>
                      {/* 内容区 */}
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
                                (data.value.blocks.map((block,index) => (
                                  <EditorBlock
                                  class = {block.focus ? 'block-focus' : ''}
                                  class = {preViewRef.value ? 'block-editing' : ''} // 为什么能覆盖editor-block的::after样式?
                                  block = {block}
                                  onMousedown = {(e)=> blockMousedown(e, block, index)}
                                  onContextmenu = {(e)=> contextmenuBlock(e, block)}
                                  formData = {props.formData}
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
