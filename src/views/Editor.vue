<template>
  <div class="editor-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/">
            <img
              alt="Vue logo"
              src="../assets/logo-simple.png"
              class="logo-img"
            />
          </router-link>
          <input-edit :value="pageState.title" @change="titleChange">
            <h4>{{ pageState.title }}</h4>
          </input-edit>
        </div>
        <a-menu
          :selectable="false"
          theme="dark"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">
            <a-button type="primary" @click="previewWork">预览和设置</a-button>
          </a-menu-item>
          <a-menu-item key="2">
            <a-button type="primary" @click="saveWork(true)" :loading="isSaving"
              >保存</a-button
            >
          </a-menu-item>
          <a-menu-item key="3">
            <a-button
              type="primary"
              @click="publishWork"
              :loading="isPublishing"
              >发布</a-button
            >
          </a-menu-item>
          <a-menu-item key="4">
            <user-profile :user="userInfo" :smMode="true"></user-profile>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
    </a-layout>
    <a-layout>
      <a-layout-sider width="300" style="background: #fff">
        <div class="sidebar-container">
          组件列表
          <components-list
            :list="defaultTextTemplates"
            @onItemClick="addItem"
          />
        </div>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-layout-content class="preview-container">
          <p>画布区域</p>
          <history-area></history-area>
          <div class="preview-list" id="canvas-area">
            <div class="body-container" :style="pageState.props">
              <div v-for="component in components" :key="component.id">
                <edit-wrapper
                  v-if="!component.isHidden"
                  @setActive="setActive"
                  :id="component.id"
                  :props="component.props"
                  :active="
                    component.id === (currentElement && currentElement.id)
                  "
                  @update-position="handlePositionUpdate"
                >
                  <component
                    class="position-static"
                    :is="component.name"
                    v-bind="component.props"
                    :isEditing="true"
                  />
                </edit-wrapper>
              </div>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
      <a-layout-sider
        width="300"
        style="background: #fff"
        class="settings-panel"
      >
        <a-tabs type="card" v-model:activeKey="activePanel">
          <a-tab-pane key="component" tab="属性设置" class="no-tap-radius">
            <div v-if="currentElement && currentElement.props">
              <edit-group
                v-if="!currentElement.isLocked"
                :props="currentElement.props"
                @change="handleChange"
              ></edit-group>
              <div v-else>
                <a-empty>
                  <template #description>
                    <p>该元素被锁定，无法编辑</p>
                  </template>
                </a-empty>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="layer" tab="图层设置">
            <layer-list
              :list="components"
              :selectedId="currentId"
              @change="handleChange"
              @select="setActive"
            ></layer-list>
          </a-tab-pane>
          <a-tab-pane key="page" tab="页面设置">
            <props-table
              :props="pageState.props"
              @change="handlePageChange"
            ></props-table>
          </a-tab-pane>
        </a-tabs>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import LText from '../components/LText.vue'
import LImage from '../components/LImage.vue'
import ComponentsList from '../components/ComponentsList.vue'
import EditWrapper from '../components/EditWrapper.vue'
import PropsTable from '../components/PropsTable.vue'
// import PropsTable from '../components/PropsTable'
import EditGroup from '../components/EditGroup.vue'
import LayerList from '../components/LayerList.vue'
import InputEdit from '../components/InputEdit.vue'
import UserProfile from '../components/UserProfile.vue'
import { ComponentData } from '../store/editor'
import defaultTextTemplates from '../defaultTemplates'
import { pickBy } from 'lodash-es'
import initHotKeys from '../plugins/hotKeys'
import HistoryArea from './editor/HistoryArea.vue'
import initContextMenu from '@/plugins/contextMenu'
import { useRoute } from 'vue-router'
import useSaveWork from '../hooks/useSaveWork'

export type TabType = 'component' | 'layer' | 'page'

export default defineComponent({
  components: {
    LText,
    LImage,
    ComponentsList,
    EditWrapper,
    PropsTable,
    EditGroup,
    LayerList,
    HistoryArea,
    InputEdit,
    UserProfile,
  },
  setup() {
    initContextMenu()
    initHotKeys()
    const { isSaving, saveWork } = useSaveWork()
    const store = useStore<GlobalDataProps>()
    const route = useRoute()
    const pageState = computed(() => store.state.editor.page)
    const components = computed(() => store.state.editor.components)
    const currentElement = computed<ComponentData | null>(
      () => store.getters.getCurrentElement
    )
    const currentId = computed(() => store.state.editor.currentElement)
    const activePanel = ref<TabType>('component')

    const isPublishing = computed(() =>
      store.getters.isOpLoading('publishWork')
    )
    const userInfo = computed(() => store.state.user)

    const workId = route.params.id
    if (workId) {
      store.dispatch('fetchWork', { urlParams: { id: workId } })
    }
    const previewWork = () => {
      console.log('previewWork')
    }

    const publishWork = () => {
      console.log('publishWork')
    }

    const addItem = (component: ComponentData) => {
      store.commit('addComponent', component)
    }
    const setActive = (id: string) => {
      store.commit('setActive', id)
    }
    const handleChange = (e: any) => {
      console.log('event', e)
      store.commit('updateComponent', e)
    }
    const handlePageChange = (e: string) => {
      console.log('event', e)
      store.commit('updatePage', e)
    }
    const handlePositionUpdate = (data: {
      left: number
      top: number
      id: string
    }) => {
      const { id } = data
      const updateData = pickBy(data, (v, k) => k !== 'id')
      console.log(updateData)
      const keysArr = Object.keys(updateData)
      const valuesArr = Object.values(updateData).map((value) => value + 'px')
      store.commit('updateComponent', { key: keysArr, value: valuesArr, id })
    }
    const titleChange = (newValue: string) => {
      store.commit('updatePage', {
        key: 'title',
        value: newValue,
        isRoot: true,
      })
    }

    return {
      components,
      defaultTextTemplates,
      addItem,
      setActive,
      currentElement,
      handleChange,
      activePanel,
      currentId,
      pageState,
      handlePageChange,
      handlePositionUpdate,
      titleChange,
      isSaving,
      isPublishing,
      userInfo,
      previewWork,
      saveWork,
      publishWork,
    }
  },
})
</script>

<style>
.header {
  display: flex;
  justify-content: space-between;
}
.header .logo-img {
  margin-right: 20px;
  height: 40px;
}
.page-title {
  display: flex;
}
.header h4 {
  color: #ffffff;
}
.editor-spinner {
  position: fixed;
  right: 50%;
  top: 10px;
}
.preview-container {
  padding: 24px;
  margin: 0;
  min-height: 90vh !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.preview-list {
  padding: 0;
  margin: 0;
  min-width: 375px;
  min-height: 200px;
  border: 1px solid #efefef;
  background: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  margin-top: 50px;
  max-height: 80vh;
}
.preview-list.active {
  border: 1px solid #1890ff;
}
.preview-list.canvas-fix .l-text-component,
.preview-list.canvas-fix .l-image-component,
.preview-list.canvas-fix .l-shape-component {
  box-shadow: none !important;
}
.preview-list.canvas-fix {
  position: absolute;
  max-height: none;
}
.sidebar-container {
  padding: 20px;
}
/* .body-container {
  width: 100%;
  height: 100%;
  background-size: cover;
} */
.page-settings {
  padding: 16px;
}
.settings-panel .ant-tabs-top-content {
  max-height: calc(100vh - 68px - 56px);
  overflow-y: auto;
}
.final-preview {
  position: absolute;
  width: calc(100% - 400px);
  height: 100%;
  background: transparent;
  top: 0;
  left: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.final-preview-inner {
  width: 430px;
  height: 870px;
  padding: 60px 28px;
  position: relative;
  /* background: url('~@/assets/phone-back.png') no-repeat; */
  background-size: cover;
}
.final-preview-inner .preview-title {
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-weight: bold;
}
.iframe-container {
  width: 100%;
  height: 706px;
  overflow-y: auto;
  overflow-x: hidden;
}
.iframe-placeholder {
  /* background: url('~@/assets/loading.svg') 50% 50% no-repeat; */
  background-size: 50px;
}
.settings-panel .ant-list-bordered {
  border-radius: 0;
}
.settings-panel .ant-collapse {
  border-radius: 0;
}
.ant-collapse-header,
.ant-collapse-item {
  border-radius: 0 !important;
}
.settings-panel .ant-tabs-tab {
  border-radius: 0 !important;
}
</style>
