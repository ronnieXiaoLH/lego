<template>
  <div class="image-processer">
    <a-modal
      title="裁剪图片"
      v-model:visible="showModal"
      @ok="handleOk"
      @cancel="showModal = false"
      okText="确认"
      cancelText="取消"
    >
      <div class="image-cropper">
        <img :src="baseImageUrl" id="processed-image" ref="cropperImg" />
      </div>
    </a-modal>
    <div
      class="image-preview"
      :style="{ backgroundImage: backgroundUrl }"
    ></div>
    <div class="image-process">
      <uploader>
        <div class="uploader-container">
          <a-button>
            <template v-slot:icon><UploadOutlined /></template>更换图片
          </a-button>
        </div>
      </uploader>
      <a-button @click="showModal = true">
        <template v-slot:icon><ScissorOutlined /></template>裁剪图片
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import Cropper from 'cropperjs'
import {
  UploadOutlined,
  ScissorOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import Uploader from './Uploader.vue'

interface CropDataProps {
  x: number
  y: number
  width: number
  height: number
}

export default defineComponent({
  components: {
    Uploader,
    UploadOutlined,
    ScissorOutlined,
    LoadingOutlined, // eslint-disable-line
    DeleteOutlined, // eslint-disable-line
  },
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ['change', 'uploaded'],
  setup(props, context) {
    const showModal = ref(false)
    const baseImageUrl = computed(() => props.value.split('?')[0])
    const backgroundUrl = computed(() => `url(${props.value})`)
    const cropperImg = ref<null | HTMLImageElement>(null)

    let cropper: Cropper
    let cropData: CropDataProps | null = null
    watch(showModal, async (newVal) => {
      if (newVal) {
        await nextTick()
        if (cropperImg.value) {
          cropper = new Cropper(cropperImg.value, {
            crop(event) {
              const { x, y, width, height } = event.detail
              cropData = {
                x: Math.floor(x),
                y: Math.floor(y),
                width: Math.floor(width),
                height: Math.floor(height),
              }
            },
          })
        }
      } else {
        cropper && cropper.destroy()
      }
    })

    const handleOk = () => {
      const { x, y, width, height } = cropData as CropDataProps
      // 裁剪的是阿里云 OSS 上的图片
      const cropperedUrl =
        baseImageUrl.value +
        `?x-oss-process=image/crop,x_${x},y_${y},w_${width},h_${height}`
      context.emit('change', cropperedUrl)

      // 不使用阿里云 OSS ，拿到截图的图片再次上传处理
      // cropper.getCroppedCanvas().toBlob((blob) => {
      //   if (blob) {
      //     const formData = new FormData()
      //     formData.append('croppedImage', blob, 'test.jpeg')
      //     axios
      //       .post('http://localhost:3000/api/utils/upload-img', formData, {
      //         headers: {
      //           'Content-Type': 'multipart/form-data',
      //         },
      //       })
      //       .then((res) => {
      //         console.log(res)
      //         context.emit('change', res.data.url[0])
      //         showModal.value = false
      //       })
      //   }
      // })

      // 不使用阿里云 OSS ，拿到截图的图片再次上传处理
      // const dataUrl = cropper.getCroppedCanvas().toDataURL()
      // console.log(dataUrl)
      // context.emit('change', dataUrl)

      showModal.value = false
    }

    return {
      showModal,
      baseImageUrl,
      backgroundUrl,
      cropperImg,
      handleOk,
    }
  },
})
</script>

<style>
.image-processer {
  display: flex;
  justify-content: space-between;
}
.image-preview {
  width: 150px;
  height: 84px;
  border: 1px dashed #e6ebed;
  background: no-repeat 50% / contain;
}
.image-preview.extraHeight {
  height: 110px;
}
.image-cropper img {
  display: block;
  /* This rule is very important, please don't ignore this */
  max-width: 100%;
}
.image-process {
  padding: 5px 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>