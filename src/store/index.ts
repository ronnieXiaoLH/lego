import { createStore } from 'vuex'
import user, { UserProps } from './user'
import editor, { EditorProps } from './editor'
import templates, { TemplatesProps } from './templates'
import global, { GlobalStatus } from './global'

export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
  global: GlobalStatus
}

const store = createStore({
  modules: {
    user,
    editor,
    templates,
    global,
  },
})

export default store
