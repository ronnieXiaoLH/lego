<template>
  <div class="content-container">
    <template-list :list="testData"></template-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import TemplateList from '../components/TemplateList.vue'
// import axios from 'axios'
// import { message } from 'ant-design-vue'
export default defineComponent({
  components: {
    TemplateList,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const testData = computed(() => store.state.templates.data)
    // const currentUser = computed(() => store.state.user)
    onMounted(() => {
      store.dispatch('fetchTemplates')
      // if (!currentUser.value.isLogin && currentUser.value.token) {
      //   axios.defaults.headers.common.Authorization = `Bearer ${currentUser.value.token}`
      //   store.dispatch('fetchCurrentUser').catch(() => {
      //     message.error('登录状态已过期，请重新登录')
      //     localStorage.setItem('token', '')
      //     delete axios.defaults.headers.common.Authorization
      //   })
      // }
    })
    return {
      testData,
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