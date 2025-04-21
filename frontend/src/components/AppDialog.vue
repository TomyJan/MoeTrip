<template>
  <v-dialog
    v-model="localShow"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      
      <v-card-text>
        <slot></slot>
      </v-card-text>
      
      <v-card-actions v-if="!hideActions" class="d-flex">
        <v-spacer v-if="alignActionsEnd"></v-spacer>
        <slot name="actions">
          <v-btn color="grey" @click="onCancel">{{ cancelText }}</v-btn>
          <v-btn
            color="primary"
            class="ml-2"
            :loading="loading"
            @click="onConfirm"
          >
            {{ confirmText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  title: string
  subtitle?: string
  maxWidth?: string | number
  cancelText?: string
  confirmText?: string
  loading?: boolean
  persistent?: boolean
  alignActionsEnd?: boolean
  hideActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  maxWidth: 500,
  cancelText: '取消',
  confirmText: '确认',
  loading: false,
  persistent: false,
  alignActionsEnd: true,
  hideActions: false
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'cancel'): void
  (e: 'confirm'): void
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

function onCancel() {
  emit('cancel')
  localShow.value = false
}

function onConfirm() {
  emit('confirm')
}
</script>
