import { GlobalDataProps } from '@/store'
import { computed, ComputedRef, ref } from 'vue'
import { useStore } from 'vuex'

interface LoadParams {
  pageIndex: number
  pageSize: number
  [key: string]: any
}

export default function useLoadMore(
  actionName: string,
  total: ComputedRef<number>,
  params: LoadParams = { pageIndex: 0, pageSize: 8 }
) {
  const store = useStore<GlobalDataProps>()
  const pageIndex = ref(params.pageIndex)
  const requestParams = computed(() => ({
    ...params,
    pageIndex: pageIndex.value + 1,
  }))
  const loadMorePage = () => {
    store
      .dispatch(actionName, { searchParams: requestParams.value })
      .then(() => {
        // 获取到数据后，需要更新 pageIndex 供下次调用
        pageIndex.value++
      })
  }
  const isLastPage = computed(() => {
    return Math.ceil(total.value / params.pageSize) === pageIndex.value + 1
  })

  return {
    loadMorePage,
    isLastPage,
    pageIndex,
  }
}
