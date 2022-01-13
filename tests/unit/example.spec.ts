import { mount, shallowMount, flushPromises } from "@vue/test-utils"
import axios from "axios"
import HelloWorld from "@/components/HelloWorld.vue"
import Hello from "@/components/Hello.vue"

jest.mock("axios")
// 获得 axios mock 类型
const mockAxios = axios as jest.Mocked<typeof axios>

// shallowMount 只渲染组件本身，不渲染组件的子组件
// mount 既渲染组件本身，也渲染组件的子组件
describe("HelloWorld.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message"
    // const wrapper = shallowMount(HelloWorld, {
    //   props: { msg }
    // })
    const wrapper = mount(HelloWorld, {
      props: { msg },
    })
    expect(wrapper.text()).toMatch(msg)
    expect(wrapper.get("h1").text()).toBe(msg)
    expect(wrapper.findComponent(Hello).exists()).toBeTruthy()
  })

  it("should update the count when clicking the button", async () => {
    const msg = "new message"
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    await wrapper.get("button").trigger("click")
    expect(wrapper.get("button").text()).toBe("2")
  })

  it("should add todo when fill the input and click the add button", async () => {
    const msg = "new message"
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    const todoContent = "buy milk"
    await wrapper.get("input").setValue(todoContent)
    expect(wrapper.get("input").element.value).toBe(todoContent)
    await wrapper.get(".addTodo").trigger("click")
    expect(wrapper.findAll("li")).toHaveLength(1)
    expect(wrapper.get("li").text()).toBe(todoContent)
    console.log(wrapper.emitted())
    expect(wrapper.emitted()).toHaveProperty("send")
    expect(wrapper.emitted()["send"][0]).toEqual([todoContent])
  })

  it.only("should load user message when click the load button", async () => {
    const msg = "new message"
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    mockAxios.get.mockResolvedValueOnce({ data: { username: "ronnie" } })
    await wrapper.get(".loadUser").trigger("click")
    expect(mockAxios.get).toHaveBeenCalled()
    expect(wrapper.find(".loading").exists()).toBeTruthy()
    await flushPromises()
    // 界面更新完毕
    expect(wrapper.find(".loading").exists()).toBeFalsy()
    expect(wrapper.get(".userName").text()).toBe("ronnie")
  })

  it.only("should load error when return promise reject", async () => {
    const msg = "new message"
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    mockAxios.get.mockRejectedValueOnce("error")
    await wrapper.get(".loadUser").trigger("click")
    expect(mockAxios.get).toHaveBeenCalled()
    expect(wrapper.find(".loading").exists()).toBeTruthy()
    await flushPromises()
    // 界面更新完毕
    expect(wrapper.find(".loading").exists()).toBeFalsy()
    expect(wrapper.find(".error").exists()).toBeTruthy()
  })
})
