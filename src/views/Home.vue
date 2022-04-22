<template>
  <div class="content-container">
    <a-row>
      <template-list :list="testData"></template-list>
    </a-row>
    <a-row type="flex" justify="center">
      <a-button
        v-if="!isLastPage"
        type="primary"
        size="large"
        :loading="isLoading"
        @click="loadMorePage"
        >加载更多</a-button
      >
    </a-row>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import TemplateList from '../components/TemplateList.vue'
import useLoadMore from '../hooks/useLoadMore'
export default defineComponent({
  components: {
    TemplateList,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const testData = computed(() => store.state.templates.data)
    const total = computed(() => store.state.templates.totalTemplates)
    const { loadMorePage, isLastPage } = useLoadMore('fetchTemplates', total, {
      pageIndex: 0,
      pageSize: 4,
    })
    const isLoading = computed(() =>
      store.getters.isOpLoading('fetchTemplates')
    )
    onMounted(() => {
      store.dispatch('fetchTemplates', {
        searchParams: { pageIndex: 0, pageSize: 4 },
      })
      window.addEventListener('scroll', () => {
        if (isLoading.value) return
        // get body height
        const totalPageHeight = document.body.scrollHeight
        // get scrollPoint
        const scrollPoint = window.scrollY + window.innerHeight
        if (scrollPoint >= totalPageHeight - 2 && !isLastPage.value) {
          loadMorePage()
        }
      })
    })
    return {
      testData,
      loadMorePage,
      isLastPage,
      isLoading,
    }
  },
})
</script>

<style>
.page-title {
  color: #fff;
}
.content-container {
  background: #fff;
  padding: 0 24px 24px 30px;
  min-height: 85vh;
  max-width: 1200px;
  margin: 50px auto;
  width: 100%;
}
</style>