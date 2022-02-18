<template>
  <div class="background-processer">
    <style-uploader v-if="!value" @success="onImageUpload"></style-uploader>
    <image-processer
      v-else
      :value="value"
      @change="handleUploadUrl"
      :showDelete="true"
    ></image-processer>
  </div>
</template>

<script lang="ts">
import { UploadResp } from '@/extraType'
import { defineComponent } from 'vue'
import ImageProcesser from './ImageProcesser.vue'
import StyleUploader from './StyleUploader.vue'
export default defineComponent({
  components: {
    ImageProcesser,
    StyleUploader,
  },
  props: {
    value: {
      type: String,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const onImageUpload = (data: { resp: UploadResp; file: File }) => {
      emit('change', data.resp?.data.urls[0])
    }

    const handleUploadUrl = (url: string) => {
      emit('change', url)
    }

    return {
      onImageUpload,
      handleUploadUrl,
    }
  },
})
</script>

<style>
</style>