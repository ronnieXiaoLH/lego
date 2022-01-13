<template>
  <img
    class="l-image-component"
    :style="styleProps"
    :src="src"
    @click.prevent="handleClick"
  />
</template>

<script lang="ts">
import useComponentCommon from '@/hooks/useComponentCommon'
import { defineComponent } from 'vue'
import {
  transformToComponentProps,
  imageDefaultProps,
  imageStylePropsNames,
} from '../defaultProps'
const defaultProps = transformToComponentProps(imageDefaultProps)

export default defineComponent({
  name: 'l-image',
  props: {
    ...defaultProps,
  },
  setup(props) {
    const { styleProps, handleClick } = useComponentCommon(
      props,
      imageStylePropsNames
    )

    return {
      styleProps,
      handleClick,
    }
  },
})
</script>

<style>
.l-image-component {
  max-width: 100%;
  position: relative !important;
}
</style>