<template>
  <div
    class="edit-wrapper"
    :style="styles"
    ref="editWrapper"
    @click="onItemClick(id)"
    :class="{ active: active }"
    @mousedown="startMove"
  >
    <slot></slot>
    <div class="resizers">
      <div
        class="resizer top-left"
        @mousedown.stop="startResize('top-left')"
      ></div>
      <div
        class="resizer top-right"
        @mousedown.stop="startResize('top-right')"
      ></div>
      <div
        class="resizer bottom-left"
        @mousedown.stop="startResize('bottom-left')"
      ></div>
      <div
        class="resizer bottom-right"
        @mousedown.stop="startResize('bottom-right')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref } from 'vue'
import { pick } from 'lodash-es'

type ResizeDirction = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
interface OriginalPositions {
  left: number
  right: number
  top: number
  bottom: number
}

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    props: {
      type: Object,
      required: true,
    },
  },
  emits: ['set-active', 'update-position'],
  setup(props, context) {
    const editWrapper = ref<null | HTMLElement>(null)
    const onItemClick = (id: string) => {
      context.emit('set-active', id)
    }
    const styles = computed(() =>
      pick(props.props, ['position', 'left', 'top', 'width', 'height'])
    )
    const gap = {
      x: 0,
      y: 0,
    }
    let isMoving = false
    const calculatePositionMove = (e: MouseEvent) => {
      const container = document.getElementById('canvas-area') as HTMLElement
      const left = e.clientX - gap.x - container.offsetLeft
      // 有滚动条时，需加上向上滚动的距离
      const top = e.clientY - gap.y - container.offsetTop + container.scrollTop
      return {
        left,
        top,
      }
    }
    const startMove = (e: MouseEvent) => {
      const currentElement = editWrapper.value
      if (currentElement) {
        const { left, top } = currentElement.getBoundingClientRect()
        gap.x = e.x - left
        gap.y = e.y - top
        console.log(gap)
      }
      const handleMove = (e: MouseEvent) => {
        isMoving = true
        const { left, top } = calculatePositionMove(e)
        console.log(left, top)
        if (currentElement) {
          currentElement.style.left = left + 'px'
          currentElement.style.top = top + 'px'
        }
      }
      const handleMoveUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleMove)
        if (isMoving) {
          const { left, top } = calculatePositionMove(e)
          context.emit('update-position', { left, top, id: props.id })
          isMoving = false
        }
        nextTick(() => {
          document.removeEventListener('mouseup', handleMoveUp)
        })
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleMoveUp)
    }

    const calculateSize = (
      direction: ResizeDirction,
      e: MouseEvent,
      positions: OriginalPositions
    ) => {
      const { clientX, clientY } = e
      const { left, right, top, bottom } = positions
      const container = document.getElementById('canvas-area') as HTMLElement
      // 往右拉
      const rightWidth = clientX - left
      // 往左拉
      const leftWidth = right - clientX
      // 往下拉
      const bottomHeight = clientY - top
      // 往上拉
      const topHeight = bottom - clientY
      // 有滚动条时，需加上向上滚动的距离
      const topOffset = clientY - container.offsetTop + container.scrollTop
      const leftOffset = clientX - container.offsetLeft

      switch (direction) {
        case 'top-left':
          return {
            left: leftOffset,
            top: topOffset,
            width: leftWidth,
            height: topHeight,
          }
        case 'top-right':
          return {
            top: topOffset,
            width: rightWidth,
            height: topHeight,
          }
        case 'bottom-left':
          return {
            left: leftOffset,
            width: leftWidth,
            height: bottomHeight,
          }
        case 'bottom-right':
          return {
            width: rightWidth,
            height: bottomHeight,
          }
        default:
          break
      }
    }

    const startResize = (direction: ResizeDirction) => {
      const currentElement = editWrapper.value as HTMLElement
      const { left, right, top, bottom } =
        currentElement.getBoundingClientRect()
      const handleMove = (e: MouseEvent) => {
        const size = calculateSize(direction, e, { left, right, top, bottom })
        const { style } = currentElement
        if (size) {
          style.width = size.width + 'px'
          style.height = size.height + 'px'
          if (size.left) {
            style.left = size.left + 'px'
          }
          if (size.top) {
            style.top = size.top + 'px'
          }
        }
      }
      const handleMoveUp = (e: MouseEvent) => {
        const size = calculateSize(direction, e, { left, right, top, bottom })
        context.emit('update-position', { ...size, id: props.id })
        document.removeEventListener('mousemove', handleMove)
        nextTick(() => {
          document.removeEventListener('mouseup', handleMoveUp)
        })
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleMoveUp)
    }
    return {
      onItemClick,
      styles,
      editWrapper,
      startMove,
      startResize,
    }
  },
})
</script>

<style lang="scss">
.edit-wrapper {
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}
.edit-wrapper .position-static {
  position: static !important;
  width: 100% !important;
  height: 100% !important;
}
.edit-wrapper:hover {
  border: 1px dashed #ccc;
}
.edit-wrapper.active {
  border: 1px solid #1890ff;
  user-select: none;
  z-index: 1500;
}
.edit-wrapper.active .resizers .resizer {
  width: 10px;
  height: 10px;
  border-radius: 50%; /*magic to turn square into circle*/
  background: white;
  border: 3px solid #1890ff;
  position: absolute;
  display: block;
}
.edit-wrapper .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize; /*resizer cursor*/
}
.edit-wrapper .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>