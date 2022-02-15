import { onMounted, onUnmounted, ref, Ref } from 'vue'

const clickOutside = (
  elementRef: Ref<null | HTMLElement>,
  trigger: any = false
) => {
  const isClickOutside = ref(false)
  const handler = (e: MouseEvent) => {
    if (elementRef.value && trigger.value) {
      if (elementRef.value.contains(e.target as HTMLElement)) {
        isClickOutside.value = false
      } else {
        isClickOutside.value = true
      }
    }
  }

  onMounted(() => {
    document.addEventListener('click', handler)
  })

  onUnmounted(() => {
    document.addEventListener('click', handler)
  })

  return isClickOutside
}

export default clickOutside
