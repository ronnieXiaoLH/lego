import { GlobalDataProps } from '@/store'
import { Modal } from 'ant-design-vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default function useSaveWork() {
  const store = useStore<GlobalDataProps>()
  const route = useRoute()
  const pageState = computed(() => store.state.editor.page)
  const components = computed(() => store.state.editor.components)
  const isSaving = computed(() => store.getters.isOpLoading('saveWork'))
  const isDirty = computed(() => store.state.editor.isDirty)

  // 保存函数
  const saveWork = () => {
    const { title, props } = pageState.value
    const payload = {
      title,
      content: {
        components: components.value,
        props,
      },
    }
    const workId = route.params.id
    store.dispatch('saveWork', {
      data: payload,
      urlParams: { id: workId },
    })
  }

  // 自动保存
  let timer: number
  onMounted(() => {
    timer = setInterval(() => {
      isDirty.value && saveWork()
    }, 5000)
  })
  onUnmounted(() => {
    clearInterval(timer)
  })

  // 离开页面前提示
  onBeforeRouteLeave((to, from, next) => {
    if (isDirty.value) {
      Modal.confirm({
        title: '作品还未保存，是否保存？',
        okText: '保存',
        okType: 'primary',
        cancelText: '不保存',
        onOk: async () => {
          await saveWork()
          next()
        },
      })
    } else {
      next()
    }
  })

  return {
    isSaving,
    saveWork,
  }
}
