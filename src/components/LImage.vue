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
import { defineComponent, ref } from 'vue'
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
  attrs: {},
  setup(props, { attrs }) {
    const { styleProps, handleClick } = useComponentCommon(
      props,
      imageStylePropsNames
    )
    const src = ref(attrs.imageSrc)

    return {
      styleProps,
      handleClick,
      src,
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