import { createStore } from 'vuex'
import user, { UserProps } from './user'
import editor, { EditorProps } from './editor'
import templates, { TemplatesProps } from './templates'

export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
}

const store = createStore({
  modules: {
    user,
    editor,
    templates,
  },
})

export default store
