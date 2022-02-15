<template>
  <ul
    :list="list"
    handle=".handle"
    class="ant-list-items ant-list-bordered"
    ghost-class="ghost"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <li
      class="ant-list-item"
      v-for="(item, index) in list"
      :key="item.id"
      :class="{
        active: item.id === selectedId,
        dragging: item.id === dragData.currentDragging,
      }"
      @click="handleClick(item.id)"
      draggable="true"
      @dragstart="onDragStart($event, item.id, index)"
      @dragenter="onDragEnter($event, index)"
      :data-index="index"
    >
      <a-tooltip :title="item.isHidden ? '显示' : '隐藏'">
        <a-button
          shape="circle"
          @click="handleChange(item.id, 'isHidden', !item.isHidden)"
        >
          <template v-slot:icon v-if="item.isHidden"
            ><EyeInvisibleOutlined
          /></template>
          <template v-slot:icon v-else><EyeOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip :title="item.isLocked ? '解锁' : '锁定'">
        <a-button
          shape="circle"
          @click="handleChange(item.id, 'isLocked', !item.isLocked)"
        >
          <template v-slot:icon v-if="item.isLocked"
            ><LockOutlined />
          </template>
          <template v-slot:icon v-else><unlockOutlined /> </template>
        </a-button>
      </a-tooltip>
      <input-edit
        :value="item.layerName"
        @clicked="handleClick"
        @change="
          (value) => {
            handleChange(item.id, 'layerName', value)
          }
        "
      >
        <span>{{ item.layerName }}</span>
      </input-edit>
      <a-tooltip title="拖动排序">
        <a-button shape="circle" class="handle">
          <template v-slot:icon><DragOutlined /> </template
        ></a-button>
      </a-tooltip>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue'
// import { VueDraggableNext } from 'vue-draggable-next'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DragOutlined,
} from '@ant-design/icons-vue'
import { ComponentData } from '../store/editor'
import InputEdit from '../components/InputEdit.vue'
import { arrayMoveMutable } from 'array-move'

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<ComponentData[]>,
      required: true,
    },
    selectedId: {
      type: String,
      required: true,
    },
  },
  emits: ['select', 'change', 'drop'],
  components: {
    EyeOutlined,
    EyeInvisibleOutlined,
    LockOutlined,
    UnlockOutlined,
    DragOutlined,
    // Draggable: VueDraggableNext,
    InputEdit,
  },
  setup(props, context) {
    const dragData = reactive({
      currentDragging: '',
      currentIndex: -1,
    })
    let start = -1,
      end = -1
    const onDragStart = (e: DragEvent, id: string, index: number) => {
      dragData.currentDragging = id
      dragData.currentIndex = index
      start = index
    }
    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    const onDragEnter = (e: DragEvent, index: number) => {
      if (dragData.currentIndex !== index) {
        arrayMoveMutable(props.list, dragData.currentIndex, index)
        dragData.currentIndex = index
      }
      end = index
    }
    const onDrop = () => {
      context.emit('drop', start, end)
      dragData.currentDragging = ''
    }

    const handleClick = (id?: string) => {
      context.emit('select', id)
    }
    const handleChange = (id: string, key: string, value: string) => {
      const data = {
        id,
        key,
        value,
        isRoot: true,
      }
      context.emit('change', data)
    }
    return {
      handleClick,
      handleChange,
      dragData,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDrop,
    }
  },
})
</script>

<style scoped>
.dragging {
  opacity: 0.5;
}
.ant-list-item {
  padding: 10px 15px;
  transition: all 0.5s ease-out;
  cursor: pointer;
  justify-content: normal;
  border: 1px solid #fff;
  border-bottom-color: #f0f0f0;
}
.ant-list-item .handle {
  cursor: move;
  margin-left: auto;
}
.ant-list-item.active {
  border: 1px solid #1890ff;
}
.ant-list-item:hover {
  background: #e6f7ff;
}
.ant-list-item > * {
  margin-right: 10px;
}
.ant-list-item button {
  font-size: 12px;
}
</style>
