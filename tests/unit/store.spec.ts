import store from '@/store'
import { testData } from '@/store/templates'
import { testComponents, ComponentData } from '@/store/editor'
import { TextComponentProps } from '@/defaultProps'
// import { cloneDeep } from 'lodash-es'
// const cloneComponents = cloneDeep(testComponents)
const cloneComponents = JSON.parse(JSON.stringify(testComponents))

describe('test vuex store', () => {
  it('should have three modules', () => {
    expect(store.state).toHaveProperty('user')
    expect(store.state).toHaveProperty('templates')
    expect(store.state).toHaveProperty('editor')
  })

  describe('test user module', () => {
    it('test login mutation', () => {
      store.commit('login')
      expect(store.state.user.isLogin).toBeTruthy()
    })

    it('test logout mutation', () => {
      store.commit('logout')
      expect(store.state.user.isLogin).toBeFalsy()
    })
  })

  describe('test templates module', () => {
    it('should have default templates', () => {
      expect(store.state.templates.data).toHaveLength(6)
    })

    it('should get the current template by id', () => {
      const templateData = store.getters.getTemplateById(1)
      expect(templateData.title).toBe('test title 1')
    })
  })

  describe('test editor module', () => {
    it('should have default components', () => {
      expect(store.state.editor.components).toHaveLength(cloneComponents.length)
    })

    it('should get current component when set active one component', () => {
      store.commit('setActive', cloneComponents[0].id)
      expect(store.state.editor.currentElement).toBe(cloneComponents[0].id)
      const currentElement = store.getters.getCurrentElement
      expect(currentElement.id).toBe(cloneComponents[0].id)
    })

    it('add component should works fine', () => {
      const payload: Partial<TextComponentProps> = {
        text: 'test1',
      }
      store.commit('addComponent', payload)
      expect(store.state.editor.components).toHaveLength(
        cloneComponents.length + 1
      )
      const components = store.state.editor.components
      const lastItem = components[components.length - 1]
      expect(lastItem?.props.text).toBe('test1')
    })

    it('update component should works fine', () => {
      const newProps = {
        key: 'text',
        value: 'update',
      }
      store.commit('updateComponent', newProps)
      const currentElement = store.getters.getCurrentElement
      expect(currentElement.props.text).toBe('update')
    })
  })
})
