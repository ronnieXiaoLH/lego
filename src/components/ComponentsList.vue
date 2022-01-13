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
    <style-uploader @success="onImageUpload"></style-uploader>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LText from './LText.vue'
import StyleUploader from './StyleUploader.vue'
import { UploadResp } from '../extraType'
import { message } from 'ant-design-vue'
import { ComponentData } from '@/store/editor'
import { v4 as uuidv4 } from 'uuid'
import { imageDefaultProps, TextComponentProps } from '@/defaultProps'
import { getImageDimensions } from '@/helper'
export default defineComponent({
  name: 'components-list',
  components: {
    LText,
    StyleUploader,
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  emits: ['on-item-click'],
  setup(props, context) {
    const onItemClick = (props: TextComponentProps) => {
      const componentData: ComponentData = {
        id: uuidv4(),
        name: 'l-text',
        props,
      }
      context.emit('on-item-click', componentData)
    }

    const onImageUpload = (data: { resp: UploadResp; file: File }) => {
      const { resp, file } = data
      console.log('data', resp, file)
      const componentData: ComponentData = {
        id: uuidv4(),
        name: 'l-image',
        props: {
          ...imageDefaultProps,
        },
      }
      // 调用的是 imooc 的 api 会上传失败
      // componentData.props.src = resp.data.url

      // 所以自己生成一个 base64 的地址
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.addEventListener('load', () => {
        componentData.props.src = fileReader.result as string
      })

      message.success('上传成功')
      getImageDimensions(file).then(({ width }) => {
        console.log('width', width)
        const maxWidth = 373
        componentData.props.width = (width > maxWidth ? maxWidth : width) + 'px'
        console.log(componentData.props.width)
        context.emit('on-item-click', componentData)
      })
    }

    return {
      onItemClick,
      onImageUpload,
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