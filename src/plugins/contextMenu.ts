import createContextMenu, { ActionItem } from '@/components/createContextMenu'
import { GlobalDataProps } from '@/store'
import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const initContextMenu = () => {
  const store = useStore<GlobalDataProps>()
  const testActions: ActionItem[] = [
    {
      text: '拷贝图层',
      shortcut: '⌘C / Ctrl+C',
      action: (cid) => {
        store.commit('copyComponent', cid)
      },
    },
    {
      text: '粘贴图层',
      shortcut: '⌘V / Ctrl+V',
      action: (cid) => {
        store.commit('pasteCopiedComponent', cid)
      },
    },
    {
      text: '删除图层',
      shortcut: 'Backspace / Delete',
      action: (cid) => {
        store.commit('deleteComponent', cid)
      },
    },
    {
      text: '取消选中',
      shortcut: 'ESC',
      action: () => {
        store.commit('setActive', '')
      },
    },
    {
      text: '撤销',
      shortcut: '⌘Z / Ctrl+Z',
      action: () => {
        store.commit('undo')
      },
    },
    {
      text: '重做',
      shortcut: '⌘⇧Z / Ctrl+Shift+Z',
      action: () => {
        store.commit('redo')
      },
    },
  ]

  let callback: () => void

  onMounted(() => {
    callback = createContextMenu(testActions, 'edit-wrapper')
  })

  onUnmounted(() => {
    callback()
  })
}

export default initContextMenu
