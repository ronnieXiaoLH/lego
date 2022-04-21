import { Module, Mutation } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { message } from 'ant-design-vue'
import store, { GlobalDataProps } from './index'
import {
  AllComponentProps,
  ImageComponentProps,
  TextComponentProps,
  textDefaultProps,
} from '@/defaultProps'
import { cloneDeep } from 'lodash-es'
import { actionWrapper, insertAt } from '@/helper'
import { RespWorkData } from './respTypes'

const modifyHistory = (
  state: EditorProps,
  history: HistoryProps,
  type: 'redo' | 'undo'
) => {
  const { componentId, data } = history
  const { key, value, oldValue } = data
  const newKey = key as keyof AllComponentProps | Array<keyof AllComponentProps>
  const updateComponent = state.components.find(
    (component) => component.id === componentId
  )
  if (updateComponent) {
    if (Array.isArray(newKey)) {
      newKey.forEach((keyName, index) => {
        updateComponent.props[keyName] =
          type === 'undo' ? oldValue[index] : value[index]
      })
    } else {
      updateComponent.props[newKey] = type === 'undo' ? oldValue : value
    }
  }
}

const debounceChange = (callback: (...args: any[]) => void, delay = 1000) => {
  let timer = 0
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

const pushHistory = (state: EditorProps, historyRecord: HistoryProps) => {
  if (state.historyIndex !== -1) {
    state.historys = state.historys.slice(0, state.historyIndex)
  }
  if (state.historys.length < state.maxHistoryNumber) {
    state.historys.push(historyRecord)
    state.historyIndex = -1
  } else {
    state.historys.shift()
    state.historys.push(historyRecord)
  }
}

const pushModifyHistory = (
  state: EditorProps,
  { key, value, id }: UpdateComponentData,
  oldValue: any
) => {
  pushHistory(state, {
    id: uuidv4(),
    componentId: id || state.currentElement,
    type: 'modify',
    data: {
      key,
      value,
      oldValue,
    },
  })
  state.cachedOldValue = null
}

const pushModifyHistoryDebounce = debounceChange(pushModifyHistory)

export type MoveDirection = 'Up' | 'Down' | 'Left' | 'Right'

export interface HistoryProps {
  id: string
  componentId: string
  type: 'add' | 'delete' | 'modify'
  data?: any
  index?: number
}

export interface EditorProps {
  // 中间编辑器渲染的数组
  components: ComponentData[]
  // 当前编辑的是哪个元素 uuid
  currentElement: string
  page: PageData
  // 当前复制的组件
  copiedComponent?: ComponentData | null
  // 历史记录
  historys: HistoryProps[]
  // 第几条历史记录
  historyIndex: number
  // 撤销需要回到的原始值
  cachedOldValue: any
  // 保存的做大历史记录数
  maxHistoryNumber: number
  // 数据是否有修改
  isDirty: boolean
}

export interface PageProps {
  backgroundColor: string
  backgroundImage: string
  backgroundRepeat: string
  backgroundSize: string
  height: string
}

export type allFormProps = PageProps & AllComponentProps

export interface PageData {
  id?: string
  props: PageProps
  title: string
  desc?: string
  coverImg?: string
}

export interface ComponentData {
  props: Partial<TextComponentProps & ImageComponentProps>
  // 组件 id, uuid v4 生成
  id: string
  // 组件库的名称
  name: string
  // 图层是否隐藏
  isHidden?: boolean
  // 图层是否锁定
  isLocked?: boolean
  // 图层名称
  layerName?: string
}

export const testComponents: ComponentData[] = [
  {
    id: uuidv4(),
    name: 'l-text',
    layerName: '图层1',
    props: {
      ...textDefaultProps,
      text: 'hello',
      fontSize: '20px',
      color: '#000000',
      lineHeight: '1',
      textAlign: 'left',
      fontFamily: '',
      width: '100px',
      height: '100px',
      top: '10px',
      left: '10px',
      backgroundColor: '#666',
    },
  },
  // {
  //   id: uuidv4(),
  //   name: 'l-text',
  //   layerName: '图层2',
  //   props: {
  //     ...textDefaultProps,
  //     text: 'hello2',
  //     fontSize: '10px',
  //     fontWeight: 'bold',
  //     lineHeight: '2',
  //     textAlign: 'left',
  //     fontFamily: '',
  //   },
  // },
  // {
  //   id: uuidv4(),
  //   name: 'l-text',
  //   layerName: '图层3',
  //   props: {
  //     ...textDefaultProps,
  //     text: 'hello3',
  //     fontSize: '15px',
  //     actionType: 'url',
  //     url: 'https://www.baidu.com',
  //     lineHeight: '3',
  //     textAlign: 'left',
  //     fontFamily: '',
  //   },
  // },
]

const pageDefaultProps = {
  backgroundColor: '#ffffff',
  backgroundImage: '',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  height: '560px',
}

export interface UpdateComponentData {
  key: keyof AllComponentProps | Array<keyof AllComponentProps>
  value: string | string[]
  id: string
  isRoot?: boolean
}

// 对改变编辑作品数据的 mutation 设置 isDirty 为 true，表示作品数据有更新，用于自动保存作品数据
const setDirtyWrapper = (callback: Mutation<EditorProps>) => {
  return (state: EditorProps, payload: any) => {
    state.isDirty = true
    callback(state, payload)
  }
}

const editor: Module<EditorProps, GlobalDataProps> = {
  state: {
    components: testComponents,
    currentElement: '',
    page: {
      props: pageDefaultProps,
      title: 'test title',
    },
    historys: [],
    historyIndex: -1,
    cachedOldValue: null,
    maxHistoryNumber: 5,
    isDirty: false,
  },
  mutations: {
    addComponent: setDirtyWrapper((state, componentData: ComponentData) => {
      componentData.layerName = '图层' + (state.components.length + 1)
      state.components.push(componentData)
      pushHistory(state, {
        id: uuidv4(),
        componentId: componentData.id,
        type: 'add',
        data: cloneDeep(componentData),
      })
    }),
    setActive(state, currentId: string) {
      state.currentElement = currentId
    },
    updateComponent: setDirtyWrapper(
      (state, { key, value, id, isRoot }: UpdateComponentData) => {
        const updatedComponent = state.components.find(
          (component) => component.id === (id || state.currentElement)
        )
        if (updatedComponent) {
          if (isRoot) {
            // eslint-disable-next-line
            ;(updatedComponent as any)[key as string] = value
          } else {
            const oldValue =
              Array.isArray(key) && Array.isArray(value)
                ? key.map((keyName) => updatedComponent.props[keyName])
                : updatedComponent.props[key as keyof AllComponentProps]
            if (!state.cachedOldValue) {
              state.cachedOldValue = oldValue
            }
            pushModifyHistoryDebounce(
              state,
              { key, value, id },
              state.cachedOldValue
            )
            // 避免一次修改多个 key, value 的时候(比如拖动)，会产生多条历史记录
            if (Array.isArray(key) && Array.isArray(value)) {
              key.forEach((keyName, index) => {
                updatedComponent.props[keyName] = value[index]
              })
            } else if (typeof key === 'string' && typeof value === 'string') {
              updatedComponent.props[key] = value
            }
          }
        }
      }
    ),
    updatePage(state, { key, value, isRoot = false }) {
      if (isRoot) {
        state.page[key as keyof PageData] = value
      } else {
        state.page.props[key as keyof PageProps] = value
      }
    },
    copyComponent(state, id) {
      const currentElement = store.getters.getElement(id) as ComponentData
      if (currentElement) {
        state.copiedComponent = currentElement
        message.success('已拷贝当前图层', 1)
      } else {
        state.copiedComponent = null
      }
    },
    pasteCopiedComponent: setDirtyWrapper((state) => {
      if (!state.copiedComponent) return
      const cloneData = cloneDeep(state.copiedComponent)
      cloneData.id = uuidv4()
      cloneData.layerName += '副本'
      state.components.push(cloneData)
      message.success('粘贴图层成功', 1)
      pushHistory(state, {
        id: uuidv4(),
        componentId: cloneData.id,
        type: 'add',
        data: cloneDeep(cloneData),
      })
    }),
    deleteComponent: setDirtyWrapper((state, id) => {
      const currentElement = store.getters.getElement(id) as ComponentData
      if (currentElement) {
        state.components = state.components.filter(
          (component) => component.id !== id
        )
        message.success('当前图层删除成功', 1)
        const index = state.components.findIndex(
          (component) => component.id === id
        )
        pushHistory(state, {
          id: uuidv4(),
          componentId: currentElement.id,
          type: 'delete',
          data: currentElement,
          index,
        })
      }
    }),
    moveComponent: setDirtyWrapper(
      (
        state,
        data: { direction: MoveDirection; amount: number; id: string }
      ) => {
        const currentElement = store.getters.getElement(
          data.id
        ) as ComponentData
        if (currentElement) {
          const oldTop = parseInt(currentElement.props.top || '0')
          const oldLeft = parseInt(currentElement.props.left || '0')
          const { direction, amount } = data
          switch (direction) {
            case 'Up': {
              const newValue = oldTop - amount + 'px'
              store.commit('updateComponent', {
                key: 'top',
                value: newValue,
                id: data.id,
              })
              break
            }
            case 'Down': {
              const newValue = oldTop + amount + 'px'
              store.commit('updateComponent', {
                key: 'top',
                value: newValue,
                id: data.id,
              })
              break
            }
            case 'Left': {
              const newValue = oldLeft - amount + 'px'
              store.commit('updateComponent', {
                key: 'left',
                value: newValue,
                id: data.id,
              })
              break
            }
            case 'Right': {
              const newValue = oldLeft + amount + 'px'
              store.commit('updateComponent', {
                key: 'left',
                value: newValue,
                id: data.id,
              })
              break
            }

            default:
              break
          }
        }
      }
    ),
    undo(state) {
      // never undo before
      if (state.historyIndex === -1) {
        // undo the last item of the array
        state.historyIndex = state.historys.length - 1
      } else {
        // undo to the previous step
        state.historyIndex--
      }
      // get the history record
      const history = state.historys[state.historyIndex]
      switch (history.type) {
        case 'add':
          // if create a component, we should remove it
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          )
          break
        case 'delete':
          // if delete a component, we should restore it to the right position
          state.components = insertAt(
            state.components,
            history.index as number,
            history.data
          )
          break
        case 'modify': {
          // get the modified component by id, restore to the oldValue
          modifyHistory(state, history, 'undo')
          break
        }
        default:
          break
      }
    },
    redo(state) {
      // can't redo when historyIndex is the last item or historyIndex never moved
      if (state.historyIndex === -1) return
      // get the record
      const history = state.historys[state.historyIndex]
      switch (history.type) {
        case 'add':
          state.components.push(history.data)
          break
        case 'delete':
          state.components = state.components.filter(
            (component) => component.id === history.componentId
          )
          break
        case 'modify': {
          modifyHistory(state, history, 'redo')
          break
        }
        default:
          break
      }
      state.historyIndex++
    },
    fetchWork(state, { data }: RespWorkData) {
      console.log('data', data)
      const { content, ...rest } = data
      const { components, props } = content
      state.components = components
      state.page.props = props as PageProps
      state.page.title = rest.title
      state.page.desc = rest.desc
      state.page.coverImg = rest.coverImg
      state.page.id = rest.id
    },
    saveWork(state) {
      // 作品数据保存成功后，重置 isDirty
      state.isDirty = false
    },
  },
  actions: {
    fetchWork: actionWrapper('/api/works/:id', 'fetchWork'),
    saveWork: actionWrapper('/api/works/:id', 'saveWork', { method: 'patch' }),
  },
  getters: {
    getCurrentElement: (state) => {
      return state.components.find(
        (component) => component.id === state.currentElement
      )
    },
    getElement: (state) => (id: string) => {
      return state.components.find(
        (component) => component.id === id || state.currentElement
      )
    },
    checkUndoDisable: (state) => {
      // 1. no history item
      // 2. move to the first item
      if (state.historys.length === 0 || state.historyIndex === 0) return true
      return false
    },
    checkRedoDisable: (state) => {
      // 1. no history item
      // 2. move to the last item
      // 3. never undo before
      if (
        state.historys.length === 0 ||
        state.historyIndex === state.historys.length ||
        state.historyIndex === -1
      )
        return true
      return false
    },
  },
}

export default editor
