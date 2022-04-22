<template>
  <div class="publish-channel-container">
    <a-row :style="{ marginBottom: '20px' }">
      <a-col :span="8" class="left-col">
        封面图
        <img :src="page.coverImg" :alt="page.title" />
      </a-col>
      <a-col :span="16" class="right-col">
        <a-row>
          <a-col :span="6">
            <img
              :src="
                (page.setting && page.setting.shareImg) ||
                'http://vue-maker.oss-cn-hangzhou.aliyuncs.com/vue-marker/5f79389d4737571e2e1dc7cb.png'
              "
              :alt="page.title"
            />
          </a-col>
          <a-col :span="18" class="left-gap">
            <h4>{{ page.title }}</h4>
            <p>{{ page.desc }}</p>
          </a-col>
        </a-row>
        <a-tabs type="card" :style="{ marginTop: '20px' }" @change="tabChange">
          <a-tab-pane key="channels" tab="发布为作品">
            <a-row
              v-for="channel in channels"
              :key="channel.id"
              class="channel-item"
            >
              <a-col :span="6">
                <canvas
                  :id="`channel-barcode-${channel.id}`"
                  class="barcode-container"
                ></canvas>
              </a-col>
              <a-col :span="18" class="left-gap">
                <h4>{{ channel.name }}</h4>
                <a-row>
                  <a-col :span="18">
                    <a-input
                      :value="generateChannelURL(channel.id)"
                      :readonly="true"
                      :id="`channel-url-${channel.id}`"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-button
                      class="copy-button"
                      :data-clipboard-target="`#channel-url-${channel.id}`"
                      >复制</a-button
                    >
                  </a-col>
                </a-row>
              </a-col>
              <div class="delete-area">
                <a-button
                  type="danger"
                  size="small"
                  @click="deleteChannel(channel.id)"
                  :disabled="deleteDisabled"
                  >删除渠道</a-button
                >
              </div>
            </a-row>
            <a-form
              layout="inline"
              :model="form"
              :rules="rules"
              ref="publishForm"
              :style="{ marginTop: '20px' }"
            >
              <a-form-item name="channelName">
                <a-input
                  v-model:value="form.channelName"
                  placeholder="渠道名称"
                ></a-input>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="createChannel">
                  创建新渠道
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane key="template" tab="发布为模版">
            <a-row class="channel-item">
              <a-col :span="6">
                <div
                  id="channel-barcode-template"
                  class="barcode-container"
                ></div>
              </a-col>
              <a-col :span="18" class="left-gap">
                <h4>模版信息</h4>
                <a-row>
                  <a-col :span="18">
                    <a-input
                      :value="generateChannelURL()"
                      :readonly="true"
                      id="channel-url-template"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-button
                      class="copy-button"
                      data-clipboard-target="#channel-url-template"
                      >复制</a-button
                    >
                  </a-col>
                </a-row>
              </a-col>
            </a-row>
            <div class="template-submit">
              <a-button type="primary" size="large" @click="publishTemplate">
                发布模版
              </a-button>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { baseH5URL } from '@/main'
import { GlobalDataProps } from '@/store'
import { useForm } from 'ant-design-vue/lib/form'
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import QRCode from 'qrcode'
import Clipboard from 'clipboard'
import { last } from 'lodash'
import { message } from 'ant-design-vue'

interface RuleFormInstance {
  validate: () => Promise<any>
}

export default defineComponent({
  setup() {
    const store = useStore<GlobalDataProps>()
    const route = useRoute()
    const workId = route.params.id as string
    const page = computed(() => store.state.editor.page)
    const channels = computed(() => store.state.editor.channels)
    const form = reactive({
      channelName: '',
    })
    const publishForm = ref() as Ref<RuleFormInstance>
    const rules = {
      channelName: [
        { required: true, message: '标题不能为空', trigger: 'blur' },
      ],
    }
    const deleteDisabled = computed(() => channels.value.length <= 1)
    const deleteChannel = (id: string) => {
      console.log('deleteChannel', id)
      store.dispatch('deleteChannel', { urlParams: { id } })
    }
    const generateChannelURL = (id?: string) =>
      id
        ? `${baseH5URL}/p/${page.value.id}-${page.value.uuid}?channel=${id}`
        : `${baseH5URL}/p/${page.value.id}-${page.value.uuid}`
    const { validate } = useForm(form, rules)
    const createChannel = async () => {
      const payload = {
        name: form.channelName,
        workId: +workId,
      }
      try {
        await validate()
        await store.dispatch('createChannel', { data: payload })
        form.channelName = ''
      } catch (error) {
        console.error(error)
      }
    }
    const publishTemplate = () => {
      console.log('publishTemplate')
    }

    const generateQRCode = (id: string, url: string) => {
      const el = document.getElementById(
        `channel-barcode-${id}`
      ) as HTMLCanvasElement
      return QRCode.toCanvas(el, url, {
        width: 100,
      })
    }

    onMounted(() => {
      const clipboard = new Clipboard('.copy-button')
      console.log('clipboard', clipboard)
      clipboard.on('success', (e) => {
        message.success('复制成功', 1)
        e.clearSelection()
      })
      channels.value.forEach(async (channel) => {
        try {
          await generateQRCode(channel.id, generateChannelURL(channel.id))
        } catch (error) {
          console.error(error)
        }
      })
    })

    watch(
      channels,
      async (newChannels, oldChannels) => {
        if (newChannels.length > oldChannels.length) {
          const createdChannel = last(newChannels)
          if (createdChannel) {
            await generateQRCode(
              createdChannel.id,
              generateChannelURL(createdChannel.id)
            )
          }
        }
      },
      {
        flush: 'post',
      }
    )

    return {
      page,
      channels,
      form,
      rules,
      publishForm,
      deleteDisabled,
      deleteChannel,
      generateChannelURL,
      createChannel,
      publishTemplate,
    }
  },
})
</script>

<style>
.left-col img {
  width: 80%;
}
.right-col img {
  width: 80px;
}
.left-gap {
  padding-left: 5px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.delete-area {
  position: absolute;
  top: 10px;
  right: 20px;
}
.channel-item {
  position: relative;
  padding: 10px 0;
  border-bottom: 1px solid #efefef;
}
.barcode-container {
  height: 80px;
  width: 80px;
}
.template-submit {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>