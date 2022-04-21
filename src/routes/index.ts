import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Editor from '../views/Editor.vue'
import TemplateDetail from '../views/TemplateDetail.vue'
import Index from '../views/Index.vue'
import Login from '../views/Login.vue'
import store from '@/store'
import axios from 'axios'
import { message } from 'ant-design-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
          meta: { title: '欢迎来到慕课乐高' },
        },
        {
          path: 'template/:id',
          name: 'template',
          component: TemplateDetail,
          meta: { title: '模板详情' },
        },
      ],
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: Editor,
      meta: {
        requiredLogin: true,
        title: '编辑我的设计',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        redirectAlreadyLogin: true,
        title: '登录到慕课乐高',
      },
    },
  ],
})

interface Meta {
  requiredLogin?: boolean
  redirectAlreadyLogin?: boolean
  title?: string
}

// 新版的 vue-router 可以不使用 next ，需要跳转直接返回对应的路由路径即可
router.beforeEach(async (to) => {
  const { user } = store.state
  const { token, isLogin } = user
  const { requiredLogin, redirectAlreadyLogin, title } = to.meta as Meta
  if (title) {
    document.title = title
  }
  if (!isLogin) {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      try {
        await store.dispatch('fetchCurrentUser')
        // 没有登录，有 token，且需要登录，且 token 可以获取到用户信息，可以通过
        return true
      } catch (error) {
        message.error('登录状态已过期，请重新登录')
        store.commit('logout')
        return '/login'
      }
    } else {
      // 没有登录，且没有 token，且需要登录，重定向到登录页
      if (requiredLogin) {
        return '/login'
      }
    }
  } else {
    // 已经登录，不需要再去登录页，重定向到首页
    if (redirectAlreadyLogin) {
      return ''
    }
  }
})

export default router
