import { Module } from 'vuex'
import { GlobalDataProps } from '.'

export interface GlobalStatus {
  requestNumber: number
  opNames: { [key: string]: boolean }
}

const global: Module<GlobalStatus, GlobalDataProps> = {
  state: {
    requestNumber: 0,
    opNames: {},
  },
  mutations: {
    startLoading(state, { opName }) {
      state.requestNumber++
      if (opName) {
        state.opNames[opName] = true
      }
    },
    finishLoading(state, { opName }) {
      setTimeout(() => {
        state.requestNumber--
        if (opName) {
          delete state.opNames[opName]
        }
      }, 1000)
    },
  },
  getters: {
    isLoading: (state) => state.requestNumber > 0,
    isOpLoading: (state) => (opName: string) => state.opNames[opName],
  },
}

export default global
