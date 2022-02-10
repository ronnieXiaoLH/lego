import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import 'cropperjs/dist/cropper.css'
import LegoComponents from 'xlh-lego-components'
import 'xlh-lego-components/dist/bundle.css'

const app = createApp(App)
app.use(Antd).use(LegoComponents).use(router).use(store).mount('#app')
