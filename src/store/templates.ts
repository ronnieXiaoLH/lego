import { Module } from 'vuex'
import { GlobalDataProps } from '.'
import { RespListData } from './respTypes'
import { actionWrapper } from '@/helper'
import { PageData } from './editor'

// export interface TemplateProps {
//   id: number
//   title: string
//   coverImg: string
//   author: string
//   copiedCount: number
// }

// export const testData: TemplateProps[] = [
//   {
//     id: 1,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-889755.png',
//     title: 'test title 1',
//     author: 'viking',
//     copiedCount: 1,
//   },
//   {
//     id: 2,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-677311.png',
//     title: '前端架构师直播海报',
//     author: 'viking',
//     copiedCount: 1,
//   },
//   {
//     id: 3,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-682056.png',
//     title: '前端架构师直播海报',
//     author: 'viking',
//     copiedCount: 1,
//   },
//   {
//     id: 4,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-677311.png',
//     title: '前端架构师直播海报',
//     author: 'viking',
//     copiedCount: 1,
//   },
//   {
//     id: 5,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-889755.png',
//     title: '前端架构师直播海报',
//     author: 'viking',
//     copiedCount: 1,
//   },
//   {
//     id: 6,
//     coverImg:
//       'https://static.imooc-lego.com/upload-files/screenshot-677311.png',
//     title: '前端架构师直播海报',
//     author: 'viking',
//     copiedCount: 1,
//   },
// ]

// Omit 将 PageData 中的 props 和 setting 属性去掉，Required 将所有的属性都转为必填
export type TemplateProps = Required<Omit<PageData, 'props' | 'setting'>>

export interface TemplatesProps {
  data: TemplateProps[]
  totalTemplates: number
}

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
    totalTemplates: 0,
  },
  mutations: {
    fetchTemplates(state, rowData: RespListData<TemplateProps>) {
      const { list, count } = rowData.data
      state.data = [...state.data, ...list]
      state.totalTemplates = count
    },
  },
  actions: {
    fetchTemplates: actionWrapper('/api/templates', 'fetchTemplates'),
  },
  getters: {
    getTemplateById: (state) => (id: string) => {
      return state.data.find((t) => t.id === id)
    },
  },
}

export default templates
