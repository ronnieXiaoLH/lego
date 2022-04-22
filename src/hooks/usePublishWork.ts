import { takeScreenshotAndUpload } from '@/helper'
import { GlobalDataProps } from '@/store'
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import useSaveWork from './useSaveWork'

export default function usePulishWork() {
  const { saveWork } = useSaveWork(true)
  const store = useStore<GlobalDataProps>()
  const route = useRoute()
  const isPublishing = ref(false)
  const canvasFix = ref(false)
  const showModal = ref(false)
  const channels = computed(() => store.state.editor.channels)
  const workId = route.params.id
  const publishWork = async () => {
    isPublishing.value = true
    // remove select element
    store.commit('setActive', '')
    canvasFix.value = true
    const el = document.getElementById('canvas-area') as HTMLElement
    await nextTick()
    try {
      // 发布作品需先把作品的截图上传到服务器
      const res = await takeScreenshotAndUpload(el)
      if (res) {
        // update page coverImg in store
        store.commit('updatePage', {
          key: 'coverImg',
          value: res.data.urls[0],
          isRoot: true,
        })
        // save work
        await saveWork()
        // publish work
        store.dispatch('publishWork', { urlParams: { id: workId } })
        // get channels list
        store.dispatch('fetchChannel', { urlParams: { id: workId } })
        // if channels list length is 0, create a new channel
        if (channels.value.length === 0) {
          store.dispatch('createChannel', {
            data: { name: '默认', workId: +workId },
          })
        }
        showModal.value = true
      }
    } catch (error) {
      console.error(error)
    } finally {
      isPublishing.value = false
      canvasFix.value = false
    }
  }

  return {
    isPublishing,
    canvasFix,
    publishWork,
    showModal,
  }
}
