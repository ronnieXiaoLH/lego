<template>
  <div class="l-shape-component" :style="styleProps" @click="handleClick"></div>
</template>

<script lang="ts">
import {
  shapeDefaultProps,
  shapeStylePropsNames,
  transformToComponentProps,
} from '@/defaultProps'
import useComponentCommon from '@/hooks/useComponentCommon'
import { defineComponent } from 'vue'
const defaultProps = transformToComponentProps(shapeDefaultProps)
export default defineComponent({
  name: 'l-shape',
  props: {
    ...defaultProps,
  },
  setup(props) {
    const { styleProps, handleClick } = useComponentCommon(
      props,
      shapeStylePropsNames
    )
    return {
      styleProps,
      handleClick,
    }
  },
})
</script>

<style>
</style>