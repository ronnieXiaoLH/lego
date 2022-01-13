import { mount, VueWrapper, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import Uploader from '@/components/Uploader.vue'

jest.mock('axios')

const mockAxios = axios as jest.Mocked<typeof axios>

let wrapper: VueWrapper<any>
const testFile = new File(['xyz'], 'test.png', { type: 'image/png' })

describe('Uploader component', () => {
  beforeAll(() => {
    wrapper = mount(Uploader, {
      props: {
        action: 'test.url',
      },
    })
  })

  it('basic layout before uploading', () => {
    expect(wrapper.find('button').exists()).toBeTruthy()
    expect(wrapper.get('button').text()).toBe('点击上传')
    expect(wrapper.get('input').isVisible()).toBeFalsy()
  })

  it('upload process should works fine', async () => {
    mockAxios.post.mockResolvedValueOnce({ status: 'success' })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    const files = [testFile] as any
    Object.defineProperty(fileInput, 'files', {
      value: files,
      writable: false,
    })
    await wrapper.get('input').trigger('change')
    expect(mockAxios.post).toHaveBeenCalledTimes(1)
    await flushPromises()
    expect(wrapper.get('button span').text()).toBe('上传成功')
  })

  it('should return error text when post is rejected', async () => {
    mockAxios.post.mockRejectedValueOnce({ error: 'error' })
    await wrapper.get('input').trigger('change')
    expect(mockAxios.post).toHaveBeenCalledTimes(2)
    await flushPromises()
    expect(wrapper.get('button span').text()).toBe('上传失败')
  })
})
