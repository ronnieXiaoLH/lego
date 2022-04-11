<template>
  <div class="context-menu-component menu-container" ref="menuRef">
    <div
      mode="vertical"
      style="width: 220px; border: 1px solid #ccc"
      :selectable="false"
    >
      <div
        class="ant-menu-item"
        v-for="action in actions"
        :key="action.key"
        @click="action.action(componentId)"
      >
        <span class="item-text">{{ action.text }}</span>
        <span class="item-shortcut">{{ action.shortcut }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getParentElement } from '@/helper'
import { defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue'
import { ActionItem } from '../components/createContextMenu'

export default defineComponent({
  props: {
    actions: {
      type: Array as PropType<ActionItem[]>,
      required: true,
    },
    triggerClass: {
      type: String,
      default: 'edit-wrapper',
    },
  },
  setup(props) {
    const menuRef = ref<HTMLElement | null>(null)
    const componentId = ref('')
    const triggerContextMenu = (e: MouseEvent) => {
      const domElement = menuRef.value as HTMLElement
      const wrapperElement = getParentElement(
        e.target as HTMLElement,
        props.triggerClass
      )
      if (wrapperElement) {
        e.preventDefault()
        domElement.style.display = 'block'
        domElement.style.top = e.pageY + 'px'
        domElement.style.left = e.pageX + 'px'
        const cid = wrapperElement.dataset.componentId
        if (cid) {
          componentId.value = cid
        }
      }
    }
    const handleClick = () => {
      const domElement = menuRef.value as HTMLElement
      domElement.style.display = 'none'
    }

    onMounted(() => {
      document.addEventListener('contextmenu', triggerContextMenu)
      document.addEventListener('click', handleClick)
    })

    onUnmounted(() => {
      document.removeEventListener('contextmenu', triggerContextMenu)
      document.removeEventListener('click', handleClick)
    })

    return {
      menuRef,
      componentId,
    }
  },
})
</script>

<style>
.menu-container {
  display: none;
  position: absolute;
  background: #fff;
  z-index: 2000;
}
.menu-container .ant-menu-item {
  display: flex;
  justify-content: space-between;
}
.menu-container .ant-menu-item:hover {
  background: #efefef;
}
.ant-menu-item .item-shortcut {
  color: #ccc;
}
</style>