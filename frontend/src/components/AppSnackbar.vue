<template>
  <v-snackbar
    v-model="localShow"
    :color="color"
    :timeout="timeout"
    :location="location"
  >
    {{ text }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="localShow = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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

watch(() => props.show, (newValue) => {
  localShow.value = newValue
})

watch(localShow, (newValue) => {
  if (newValue !== props.show) {
    emit('update:show', newValue)
  }
})
</script>
