import { mount, VueWrapper } from '@vue/test-utils'
import { message } from 'ant-design-vue'
import UserProfile from '@/components/UserProfile.vue'
import store from '@/store'

jest.mock('ant-design-vue', () => ({
  message: {
    success: jest.fn(),
  },
}))
const mockedRoutes: string[] = []
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: (url: string) => mockedRoutes.push(url),
  }),
}))

let wrapper: VueWrapper<any>

const mockComponent = {
  template: '<div><slot></slot></div>',
}
const mockComponent2 = {
  template: "<div><slot></slot><slot name='overlay'></slot></div>",
}
const globalComponents = {
  'a-button': mockComponent,
  'a-dropdown-button': mockComponent2,
  'a-menu': mockComponent,
  'a-menu-item': mockComponent,
  'router-link': mockComponent,
}

describe('UserProfile component', () => {
  beforeAll(() => {
    // 使用 jest 模拟 setTimeout
    jest.useFakeTimers()
    wrapper = mount(UserProfile, {
      props: {
        user: { isLogin: false },
      },
      // mock 组件内部使用的全局组件
      global: {
        components: globalComponents,
        provide: {
          store,
        },
      },
    })
  })

  it('should render login button when login is false', async () => {
    // 界面测试
    expect(wrapper.get('.user-profile-component').text()).toBe('登录')
    // 行为测试
    await wrapper.get('.user-profile-component').trigger('click')
    expect(message.success).toHaveBeenCalled()
    expect(store.state.user.userName).toBe('ronnie')
  })

  it('should render username when login is true', async () => {
    await wrapper.setProps({
      user: {
        isLogin: true,
        userName: 'ronnie',
      },
    })
    console.log(wrapper.html())
    expect(wrapper.get('.user-profile-component').html()).toContain('ronnie')
    expect(wrapper.find('.user-profile-dropdown').exists()).toBeTruthy()
  })

  it('should call logout and show message, call router.push after timeout', async () => {
    await wrapper.get('.user-profile-dropdown div').trigger('click')
    expect(store.state.user.isLogin).toBe(false)
    expect(message.success).toHaveBeenCalled()
    jest.runAllTimers()
    expect(mockedRoutes).toEqual(['/'])
  })

  afterEach(() => {
    ;(message as jest.Mocked<typeof message>).success.mockReset()
  })
})
