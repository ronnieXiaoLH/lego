import useHotKey from '@/hooks/useHotKey'
import { HotkeysEvent, KeyHandler } from 'hotkeys-js'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'

const wrap = (callback: KeyHandler) => {
  // 返回一个 KeyHandler 类型的函数
  const wrapperFn = (e: KeyboardEvent, event: HotkeysEvent) => {
    e.preventDefault()
    callback(e, event)
  }
  return wrapperFn
}

export default function initHotKeys() {
  const store = useStore<GlobalDataProps>()
  const currentId = computed(() => store.state.editor.currentElement)
  useHotKey('ctrl+c, command+c', () => {
    console.log('ctrl+c, command+c')
    store.commit('copyComponent', currentId.value)
  })
  useHotKey('ctrl+v, command+v', () => {
    console.log('ctrl+v, command+v')
    store.commit('pasteCopiedComponent')
  })
  useHotKey('backspace, delete', () => {
    console.log('backspace, delete')
    store.commit('deleteComponent', currentId.value)
  })
  useHotKey('esc', () => {
    console.log('esc')
    store.commit('setActive', '')
  })
  useHotKey(
    'up',
    wrap(() => {
      console.log('up')
      store.commit('moveComponent', {
        direction: 'Up',
        amount: 1,
        id: currentId.value,
      })
    })
  )
  useHotKey(
    'down',
    wrap(() => {
      console.log('down')
      store.commit('moveComponent', {
        direction: 'Down',
        amount: 1,
        id: currentId.value,
      })
    })
  )
  useHotKey(
    'left',
    wrap(() => {
      console.log('left')
      store.commit('moveComponent', {
        direction: 'Left',
        amount: 1,
        id: currentId.value,
      })
    })
  )
  useHotKey(
    'right',
    wrap(() => {
      console.log('right')
      store.commit('moveComponent', {
        direction: 'Right',
        amount: 1,
        id: currentId.value,
      })
    })
  )
  useHotKey('ctrl+z, command+z', () => {
    console.log('ctrl+z, command+z')
    store.commit('undo')
  })
  useHotKey('ctrl+y, command+y', () => {
    console.log('ctrl+y, command+y')
    store.commit('redo')
  })
}
