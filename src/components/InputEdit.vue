<template>
  <div class="inline-edit" @click.stop="handleClick" ref="wrapper">
    <a-input
      v-if="isEditing"
      v-model:value="innerValue"
      :class="{ 'input-error': !validateCheck }"
      placeholder="文本不能为空"
      ref="inputRef"
    />
    <slot v-else
      ><span>{{ innerValue }}</span></slot
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import useKeyPress from '../hooks/useKeyPress'
import useClickOutside from '../hooks/useClickOutside'

export default defineComponent({
  name: 'inline-edit',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const inputRef = ref()
    const innerValue = ref(props.value)
    const isEditing = ref(false)
    const wrapper = ref<null | HTMLElement>(null)

    const isClickOutside = useClickOutside(wrapper, isEditing)

    const validateCheck = computed(() => {
      return innerValue.value.trim() !== ''
    })

    watch(isClickOutside, () => {
      if (!validateCheck.value) return

      if (isClickOutside.value) {
        isEditing.value = false
        emit('change', innerValue.value)
        // 重置 isClickOutside 的值
        isClickOutside.value = false
      }
    })

    watch(isEditing, async () => {
      if (isEditing.value) {
        await nextTick()
        if (inputRef.value) {
          inputRef.value.focus()
        }
      }
    })

    useKeyPress('Enter', () => {
      if (!validateCheck.value) return

      isEditing.value = false
      emit('change', innerValue.value)
    })

    useKeyPress('Escape', () => {
      isEditing.value = false
      innerValue.value = props.value
    })

    const handleClick = () => {
      isEditing.value = true
    }

    return {
      inputRef,
      innerValue,
      isEditing,
      wrapper,
      validateCheck,
      handleClick,
    }
  },
})
</script>

<style>
.inline-edit {
  cursor: pointer;
}
.input-error {
  border: 1px solid #f5222d !important;
}
.input-error:focus {
  border-color: #f5222d !important;
}
.input-error::placeholder {
  color: #f5222d !important;
}
</style>