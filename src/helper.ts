import { message } from 'ant-design-vue'
import axios, { AxiosRequestConfig } from 'axios'
import html2canvas from 'html2canvas'
import { compile } from 'path-to-regexp'
import { ActionContext } from 'vuex'
import { RespUploadData } from './store/respTypes'
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

export interface ActionPayload {
  urlParams?: { [key: string]: any }
  searchParams?: { [key: string]: any }
  data?: any
}
export function objToQueryString(queryObj: { [key: string]: any }) {
  return Object.keys(queryObj)
    .map((key) => `${key}=${queryObj[key]}`)
    .join('&')
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
    const { data, urlParams, searchParams } = payload
    if (urlParams) {
      const toPath = compile(url, { encode: encodeURIComponent })
      url = toPath(urlParams)
    }
    if (searchParams) {
      // const search = new URLSearchParams()
      // Object.keys(searchParams).forEach((key) => {
      //   search.append(key, searchParams[key])
      // })
      // url += '?' + search.toString()
      url = url.split('?')[0]
      url += '?' + objToQueryString(searchParams)
    }
    const newConfig = { ...config, data, opName: commitName }
    const { data: resData } = await axios(url, newConfig)
    // 只有当请求正确响应了，才会触发对应的 mutation
    if (resData.errno === 0) {
      context.commit(commitName, { payload, ...resData })
      return resData
    }
  }
}

export async function uploadFile<R = any>(
  file: Blob,
  url = '/api/utils/upload-img',
  fileName = 'screenshot.png'
) {
  const newFile = file instanceof File ? file : new File([file], fileName)
  const fd = new FormData()
  fd.append(newFile.name, newFile)
  const { data } = await axios.post<R>(url, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

function getCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}

export async function takeScreenshotAndUpload(el: HTMLElement) {
  // get screenshot canvas
  const canvas = await html2canvas(el, { width: 375, useCORS: true, scale: 1 })
  // transform canvas to blob
  const canvasBlob = await getCanvasBlob(canvas)
  if (canvasBlob) {
    // upload blob to server
    const data = await uploadFile<RespUploadData>(canvasBlob)
    return data
  }
}

export function copyToClipboard(text: string) {
  // create a fake textarea, set value to text
  const textarea = document.createElement('textarea')
  textarea.value = text
  // define styles to be hidden
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  // append to body and select
  document.body.appendChild(textarea)
  textarea.select()
  // run execCommand in try/catch
  try {
    // 目前还是主流的方案，基本主流的浏览器都支持
    // 现在提出了 Clipboard API 来取代 document.execCommand，但是目前还是处于提案中
    return document.execCommand('copy')
  } catch (error) {
    console.warn('copy failed', error)
  } finally {
    document.body.removeChild(textarea)
  }
}
