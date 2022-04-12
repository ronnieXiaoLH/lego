import { createApp } from 'vue'
import axios, { AxiosRequestConfig } from 'axios'
import App from './App.vue'
import router from './routes'
import store from './store'
import Antd, { message } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import 'cropperjs/dist/cropper.css'
import LegoComponents from 'xlh-lego-components'
import 'xlh-lego-components/dist/bundle.css'

// const baseBackendURL = 'http://182.92.168.192:8081'
// axios.defaults.baseURL = `${baseBackendURL}/api`

export type ICustomAxiosConfig = AxiosRequestConfig & {
  opName?: string
}

axios.interceptors.request.use((config: ICustomAxiosConfig) => {
  store.commit('startLoading', { opName: config.opName })
  return config
})

axios.interceptors.response.use(
  (resp) => {
    const { config } = resp
    const newConfig = config as ICustomAxiosConfig
    store.commit('finishLoading', { opName: newConfig.opName })
    if (resp.data?.errno !== 0) {
      message.error(resp.data?.message)
      return Promise.reject(resp)
    }
    return resp
  },
  (error) => {
    store.commit('finishLoading')
    message.error('服务器错误')
    Promise.reject(error)
  }
)

const app = createApp(App)
app.use(Antd).use(LegoComponents).use(router).use(store).mount('#app')
