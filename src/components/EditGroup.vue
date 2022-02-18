<template>
  <a-collapse v-model:activeKey="currentKey">
    <a-collapse-panel
      v-for="(item, index) in editGroups"
      :key="`item-${index}`"
      :header="item.text"
    >
      <props-table :props="item.props" @change="handleChange"></props-table>
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import { difference } from 'lodash-es'
import PropsTable from '../components/PropsTable.vue'
interface GroupProps {
  text: string
  items: string[]
}
const defaultEditProps: GroupProps[] = [
  {
    text: '尺寸',
    items: [
      'height',
      'width',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
    ],
  },
  {
    text: '边框',
    items: ['borderStyle', 'borderColor', 'borderWidth', 'borderRadius'],
  },
  {
    text: '阴影与透明度',
    items: ['opacity', 'boxShadow'],
  },
  {
    text: '位置',
    items: ['left', 'top'],
  },
  {
    text: '事件功能',
    items: ['actionType', 'url'],
  },
]

export default defineComponent({
  components: {
    PropsTable,
  },
  props: {
    props: {
      type: Object,
      required: true,
    },
    groups: {
      type: Array as PropType<GroupProps[]>,
      default: defaultEditProps,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const currentKey = ref('item-0')
    const newGroups = computed(() => {
      const allNormalProps = defaultEditProps.reduce((prev, next) => {
        return [...prev, ...next.items]
      }, [] as string[])
      allNormalProps.push('tag')
      allNormalProps.push('right')
      allNormalProps.push('position')
      // 计算每一个组件的独特属性
      const specialProps = difference(Object.keys(props.props), allNormalProps)
      return [
        {
          text: '基本属性',
          items: specialProps,
        },
        ...props.groups,
      ]
    })

    const editGroups = computed(() => {
      return newGroups.value.map((group) => {
        const propsMap = {} as { [key: string]: any }
        group.items.forEach((item) => {
          propsMap[item] = props.props[item]
        })
        return {
          ...group,
          props: propsMap,
        }
      })
    })

    const handleChange = (e: any) => {
      emit('change', e)
    }

    return {
      currentKey,
      editGroups,
      handleChange,
    }
  },
})
</script>

<style>
</style>