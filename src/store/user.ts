import axios, { AxiosRequestConfig } from 'axios'
import { ActionContext, Module } from 'vuex'
import { GlobalDataProps } from './index'
import { RespData } from './respTypes'

export interface UserDataProps {
  username?: string
  id?: string
  phoneNumber?: string
  nickName?: string
  description?: string
  updatedAt?: string
  createdAt?: string
  iat?: number
  exp?: number
  picture?: string
  gender?: string
}

export interface UserProps {
  isLogin: boolean
  token?: string
  data?: UserDataProps
}

const actionWrapper = (
  url: string,
  commitName: string,
  config: AxiosRequestConfig = { method: 'get' }
) => {
  return async (context: ActionContext<any, any>, payload: any) => {
    const newConfig = { ...config, data: payload, opName: commitName }
    const { data } = await axios(url, newConfig)
    if (data.errno === 0) {
      context.commit(commitName, data)
      return data
    }
  }
}

const user: Module<UserProps, GlobalDataProps> = {
  state: {
    isLogin: false,
    data: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    token: localStorage.getItem('token') || '',
  },
  mutations: {
    login(state, rowData: RespData<{ token: string }>) {
      const { token } = rowData.data
      state.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    fetchCurrentUser(state, rowData: RespData<UserDataProps>) {
      state.isLogin = true
      state.data = rowData.data
    },
    logout(state) {
      state.isLogin = false
      localStorage.setItem('token', '')
      delete axios.defaults.headers.common.Authorization
    },
  },
  actions: {
    login: actionWrapper('/api/users/loginByPhoneNumber', 'login', {
      method: 'post',
    }),
    // login({ commit }, payload) {
    //   return axios
    //     .post('/api/users/loginByPhoneNumber', payload)
    //     .then(({ data }) => {
    //       if (data.errno === 0) {
    //         commit('login', data)
    //         return data
    //       } else {
    //         message.error(data.message)
    //       }
    //     })
    // },
    fetchCurrentUser: actionWrapper(
      '/api/users/getUserInfo',
      'fetchCurrentUser'
    ),
    // fetchCurrentUser({ commit }) {
    //   return axios.get('/api/users/getUserInfo').then(({ data }) => {
    //     if (data.errno === 0) {
    //       commit('fetchCurrentUser', data)
    //       return data
    //     } else {
    //       message.error(data.message)
    //     }
    //   })
    // },
    loginAndFetchUser({ dispatch }, payload) {
      return dispatch('login', payload).then((res) => {
        if (res?.errno === 0) {
          return dispatch('fetchCurrentUser')
        }
      })
    },
  },
}

export default user
