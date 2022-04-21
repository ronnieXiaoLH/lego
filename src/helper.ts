import { message } from 'ant-design-vue'
import axios, { AxiosRequestConfig } from 'axios'
import { compile } from 'path-to-regexp'
import { ActionContext } from 'vuex'
interface CheckCondition {
  format?: string[]
  // 使用多少 M 为单位
  size?: number
}
type ErrorType = 'size' | 'format' | null
export function beforeUploadCheck(file: File, condition: CheckCondition) {
  const { format, size } = condition
  const isValidFormat = format ? format.includes(file.type) : true
  const isValidSize = size ? file.size / 1024 / 1024 < size : true
  let error: ErrorType = null
  if (!isValidFormat) {
    error = 'format'
  }
  if (!isValidSize) {
    error = 'size'
  }
  return {
    passed: isValidFormat && isValidSize,
    error,
  }
}

export const commonUploadCheck = (file: File) => {
  const result = beforeUploadCheck(file, {
    format: ['image/jpeg', 'image/png'],
    size: 1,
  })
  const { passed, error } = result
  if (error === 'format') {
    message.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (error === 'size') {
    message.error('上传图片大小不能超过 1Mb')
  }
  return passed
}

export const getImageDimensions = (urlOrFile: string | File) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image()
    img.src =
      typeof urlOrFile === 'string' ? urlOrFile : URL.createObjectURL(urlOrFile)
    img.addEventListener('load', () => {
      const { naturalWidth: width, naturalHeight: height } = img
      resolve({ width, height })
    })
    img.addEventListener('error', () => {
      reject(new Error('There was some problem with the image.'))
    })
  })
}

export const getParentElement = (element: HTMLElement, className: string) => {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return element
    }
    element = element.parentNode as HTMLElement
  }
  return null
}

export const insertAt = (arr: any[], index: number, newItem: any) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index)]
}

export const isValidCellphone = (cellphone: string) =>
  /^1[3-9]\d{9}$/.test(cellphone)

interface ActionPayload {
  urlParams?: { [key: string]: any }
  data?: any
}
export const actionWrapper = (
  url: string,
  commitName: string,
  config: AxiosRequestConfig = { method: 'get' }
) => {
  return async (
    context: ActionContext<any, any>,
    payload: ActionPayload = {}
  ) => {
    const { data, urlParams } = payload
    console.log(urlParams)
    if (urlParams) {
      const toPath = compile(url, { encode: encodeURIComponent })
      url = toPath(urlParams)
    }
    const newConfig = { ...config, data, opName: commitName }
    const { data: resData } = await axios(url, newConfig)
    if (resData.errno === 0) {
      context.commit(commitName, resData)
      return resData
    }
  }
}
