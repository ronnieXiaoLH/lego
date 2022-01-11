<template>
  <div class="create-component-list">
    <div
      class="component-item"
      v-for="(item, index) in list"
      :key="index"
      @click="onItemClick(item)"
    >
      <l-text v-bind="item"></l-text>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LText from './LText.vue'
export default defineComponent({
  name: 'components-list',
  components: {
    LText,
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  emits: ['on-item-click'],
  setup(props, context) {
    const onItemClick = (data: any) => {
      context.emit('on-item-click', data)
    }
    return {
      onItemClick,
    }
  },
})
</script>

<style scoped>
.component-item {
  width: 100px;
  margin: 0 auto;
  margin-bottom: 15px;
}
</style>