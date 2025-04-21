<template>
  <v-snackbar
    v-model="localShow"
    :color="color"
    :timeout="timeout"
    :location="location"
    rounded="pill"
    elevation="3"
    variant="elevated"
    class="md3-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon v-if="icon" :icon="icon" class="mr-2" size="small"></v-icon>
      {{ text }}
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="localShow = false"
        rounded="pill"
        size="small"
        class="text-caption"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  show: boolean
  text: string
  color?: string
  timeout?: number
  location?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'success',
  timeout: 3000,
  location: 'top'
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const localShow = ref(props.show)

// 根据颜色自动选择图标
const icon = computed(() => {
  switch (props.color) {
    case 'success': return 'mdi-check-circle-outline'
    case 'error': return 'mdi-alert-circle-outline'
    case 'warning': return 'mdi-alert-outline'
    case 'info': return 'mdi-information-outline'
    default: return ''
  }
})

watch(() => props.show, (newValue) => {
  localShow.value = newValue
})

watch(localShow, (newValue) => {
  if (newValue !== props.show) {
    emit('update:show', newValue)
  }
})
</script>

<style scoped>
.md3-snackbar {
  min-width: 280px;
  max-width: 480px;
}

:deep(.v-snackbar__content) {
  padding: 14px 16px;
}

:deep(.v-snackbar__actions) {
  margin-inline-start: 4px;
  padding: 0;
}
</style>
