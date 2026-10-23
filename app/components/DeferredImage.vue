<script setup lang="ts">
import { cmsThumbnail } from '~/utils/cmsThumbnail'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  width?: number | string
  height?: number | string
  priority?: boolean
  sizes?: string
  thumbnailWidth?: number
}>(), {
  priority: false,
  thumbnailWidth: 960,
})

const imageElement = ref<HTMLImageElement | null>(null)
const shouldLoad = ref(props.priority)
const hasLoaded = ref(false)
const displaySrc = computed(() => cmsThumbnail(props.src, props.thumbnailWidth))
let observer: IntersectionObserver | undefined

function disconnectObserver() {
  observer?.disconnect()
  observer = undefined
}

function loadImage() {
  shouldLoad.value = true
  disconnectObserver()
}

onMounted(() => {
  if (props.priority) {
    loadImage()
    return
  }

  if (!('IntersectionObserver' in window)) {
    loadImage()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadImage()
      }
    },
    {
      rootMargin: '0px',
      threshold: 0,
    },
  )

  if (imageElement.value) {
    observer.observe(imageElement.value)
  }
})

onBeforeUnmount(disconnectObserver)

watch(
  () => props.priority,
  (priority) => {
    if (priority) {
      loadImage()
    }
  },
)
</script>

<template>
  <img
    ref="imageElement"
    :src="shouldLoad ? displaySrc : undefined"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    :loading="shouldLoad ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : 'low'"
    decoding="async"
    class="lazy-image"
    :class="{ 'lazy-image--loaded': hasLoaded }"
    @load="hasLoaded = true"
  >
</template>

<style scoped>
.lazy-image {
  opacity: 0;
  transition:
    opacity 420ms ease,
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 450ms ease;
}

.lazy-image--loaded {
  opacity: 1;
}
</style>
