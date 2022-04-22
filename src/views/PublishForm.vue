<template>
  <div class="publish-form-container">
    <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
      <a-col :span="6"> 扫码预览： </a-col>
      <a-col :span="10">
        <div id="preview-barcode-container"></div>
      </a-col>
    </a-row>
    <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
      <a-col :span="6"> 上传封面： </a-col>
      <a-col :span="10">
        <styled-uploader
          text="上传封面图"
          @file-uploaded="updateAvatar"
          :uploaded="form.uploaded"
        >
        </styled-uploader>
      </a-col>
    </a-row>
    <a-form
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :model="form"
      :rules="rules"
      ref="publishForm"
    >
      <a-form-item label="标题" required name="title">
        <a-input
          v-model:value="form.title"
          @change="updatePage('title', form.title)"
        />
      </a-form-item>
      <a-form-item label="副标题" required name="subTitle">
        <a-input
          v-model:value="form.subTitle"
          @change="updatePage('desc', form.subTitle)"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
        <a-button
          type="primary"
          @click="checkAndpublish"
          :loading="isPublishing"
        >
          发布
        </a-button>
        <a-button
          style="margin-left: 10px"
          @click="saveWork"
          :loading="isSaving"
        >
          保存
        </a-button>
        <a-button style="margin-left: 10px" @click="cancelEdit">
          取消
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['isSaving', 'isPublish'],
  setup() {
    const updateAvatar = () => {
      console.log('updateAvatar')
    }
    const updatePage = () => {
      console.log('updatePage')
    }
    const checkAndpublish = () => {
      console.log('checkAndpublish')
    }
    const saveWork = () => {
      console.log('saveWork')
    }
    const cancelEdit = () => {
      console.log('cancelEdit')
    }

    return {
      updateAvatar,
      updatePage,
      checkAndpublish,
      saveWork,
      cancelEdit,
    }
  },
})
</script>

<style>
.publish-form-container .file-upload-container {
  height: 130px;
}
.publish-form-container .ant-form-item-label {
  text-align: left;
}
#preview-barcode-container {
  border: 2px dotted #efefef;
  padding: 10px;
}
</style>