<template>
  <div class="login-page">
    <a-row>
      <a-col :span="12" class="aside">
        <div class="aside-inner">
          <router-link to="/">
            <img alt="Vue logo" src="../assets/logo2.png" class="logo-img" />
          </router-link>
          <h2>这是我用过的最好的建站工具</h2>
          <span class="text-white-70">王铁锤, Google</span>
        </div>
      </a-col>
      <a-col :span="12" class="login-area">
        <a-form :model="form" :rules="rules" ref="loginForm" layout="vertical">
          <h2>欢迎回来</h2>
          <p class="subTitle">使用手机号码和验证码登录到慕课乐高</p>
          <a-form-item label="手机号码" required name="cellphone">
            <a-input v-model:value="form.cellphone" placeholder="手机号码">
              <template v-slot:prefix
                ><UserOutlined style="color: rgba(0, 0, 0, 0.25)"
              /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="验证码" required name="verifyCode">
            <a-input v-model:value="form.verifyCode" placeholder="四位验证码">
              <template v-slot:prefix
                ><LockOutlined style="color: rgba(0, 0, 0, 0.25)"
              /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              @click="login"
              size="large"
              :loading="isLoading && opName === 'login'"
            >
              {{ isLoading && opName === 'login' ? '加载中' : '登录' }}
            </a-button>
            <a-button
              @click="getCode"
              size="large"
              :style="{ marginLeft: '20px' }"
              :disabled="codeButtonDisable"
              :loading="isLoading && opName === 'getCode'"
            >
              {{ counter === 60 ? '获取验证码' : `${counter}秒后重发` }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { isValidCellphone } from '@/helper'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '@/store'
import { useRouter } from 'vue-router'

interface RuleFormInstance {
  validate: () => Promise<any>
}

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const router = useRouter()
    const form = reactive({
      cellphone: '',
      verifyCode: '',
    })
    const cellphoneValidator = (rule: any, value: string) => {
      return new Promise((resolve, reject) => {
        const passed = isValidCellphone(value)
        // 模拟异步校验
        setTimeout(() => {
          if (passed) {
            resolve('')
          } else {
            reject('手机号码格式不正确')
          }
        }, 500)
      })
    }
    const rules = {
      cellphone: [
        { required: true, message: '手机号码不能为空', trigger: 'blur' },
        { validator: cellphoneValidator, trigger: 'blur' },
      ],
      verifyCode: [
        { required: true, message: '验证码不能为空', trigger: 'blur' },
      ],
    }
    const loginForm = ref<RuleFormInstance>()
    const isLoading = computed(() => store.getters.isLoading)
    const opName = ref('')
    const login = () => {
      opName.value = 'login'
      loginForm.value?.validate().then(() => {
        store
          .dispatch('loginAndFetchUser', {
            data: {
              phoneNumber: form.cellphone,
              veriCode: form.verifyCode,
            },
          })
          .then((res) => {
            opName.value = ''
            if (!res) return
            localStorage.setItem('userInfo', JSON.stringify(res.data))
            localStorage.setItem('token', store.state.user.token as string)
            message.success('登录成功 2秒后跳转至首页')
            setTimeout(() => {
              router.push('/')
            }, 2000)
          })
      })
    }
    const counter = ref(60)
    const codeButtonDisable = computed(
      () => !isValidCellphone(form.cellphone) || counter.value !== 60
    )
    let timer: any
    const startCounter = () => {
      counter.value--
      timer = setInterval(() => {
        counter.value--
      }, 1000)
    }
    watch(counter, (newVal) => {
      if (newVal === 0) {
        clearInterval(timer)
        counter.value = 60
      }
    })
    const getCode = async () => {
      opName.value = 'getCode'
      const { data } = await axios.post('/api/users/genVeriCode', {
        phoneNumber: form.cellphone,
      })
      if (data.errno === 0) {
        startCounter()
        message.success('验证码发送成功')
        opName.value = ''
      }
    }

    onUnmounted(() => {
      timer && clearInterval(timer)
    })

    return {
      form,
      rules,
      loginForm,
      login,
      codeButtonDisable,
      counter,
      getCode,
      isLoading,
      opName,
    }
  },
})
</script>

<style>
.logo-area {
  position: absolute;
  top: 30px;
  width: 150px;
}
.aside {
  height: 100vh;
  background-color: #1a1919;
  background-image: url('~@/assets/login.png');
  background-size: cover;
  background-repeat: no-repeat;
}
.aside .logo-img {
  width: 200px;
  margin-bottom: 20px;
}
.aside h2 {
  color: #cccccc;
  font-size: 29px;
}
.aside-inner {
  width: 60%;
  text-align: center;
}
.login-area {
  height: 100vh;
}
.login-area .ant-form {
  width: 350px;
}
.text-white-70 {
  color: #999;
  display: block;
  font-size: 19px;
}
.aside,
.login-area {
  display: flex !important;
  align-items: center;
  justify-content: center;
}
.login-area h2 {
  color: #333333;
  font-size: 29px;
}
.login-area .subTitle {
  color: #666666;
  font-size: 19px;
}
.login-area .ant-form-item-label {
  display: none;
}
.login-area .ant-input-prefix {
  left: auto;
  right: 30px;
  font-size: 19px;
}
.login-area .ant-input {
  font-size: 17px;
  padding: 20px 45px 20px 30px;
  background-color: #ebf2ff;
  border-color: #ebf2ff;
}
</style>