import { ActionPayload } from '@/helper'
import { ComponentData, PageData, PageProps } from './editor'

export interface RespData<T> {
  errno: number
  data: T
  message?: string
  payload?: ActionPayload
}

export interface ListData<T> {
  list: T[]
  count: number
}

export type RespListData<T> = RespData<ListData<T>>

export interface WorkData extends Omit<PageData, 'props'> {
  content: {
    components: ComponentData[]
    props?: PageProps
  }
}

export type RespWorkData = RespData<WorkData>

export interface UplodaData {
  urls: string[]
}

export type RespUploadData = RespData<UplodaData>
