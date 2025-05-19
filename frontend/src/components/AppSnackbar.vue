<template>
  <v-snackbar
    v-model="localShow"
    :color="color"
    :timeout="timeout"
    :location="location"
    rounded="lg"
    elevation="2"
    variant="elevated"
    class="md3-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon v-if="icon" :icon="icon" class="mr-3" size="small"></v-icon>
      <span class="md-body-medium">{{ text }}</span>
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="localShow = false"
        rounded="pill"
        size="small"
        class="md-label-large snackbar-action"
        :style="{ color: getButtonColor }"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Props {
  show: boolean;
  text: string;
  color?: string;
  timeout?: number;
  location?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'success',
  timeout: 3000,
  location: 'bottom',
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const localShow = ref(props.show);

// 根据颜色自动选择图标
const icon = computed(() => {
  switch (props.color) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
      return 'mdi-information';
    default:
      return '';
  }
});

// 根据颜色计算按钮颜色
const getButtonColor = computed(() => {
  if (props.color === 'success') return 'var(--md-primary-container)';
  if (props.color === 'error') return 'var(--md-error-container)';
  if (props.color === 'warning') return 'var(--md-tertiary-container)';
  if (props.color === 'info') return 'var(--md-secondary-container)';
  return '';
});

watch(
  () => props.show,
  (newValue) => {
    localShow.value = newValue;
  },
);

watch(localShow, (newValue) => {
  if (newValue !== props.show) {
    emit('update:show', newValue);
  }
});
</script>

<style scoped>
.md3-snackbar {
  min-width: 280px;
  max-width: 480px;
  border-radius: 8px !important;
}

:deep(.v-snackbar__wrapper) {
  max-width: 90vw;
  min-height: 48px;
  box-shadow: var(--md-shadow-3);
}

:deep(.v-snackbar__content) {
  padding: 14px 16px;
  font-size: 14px;
  letter-spacing: 0.25px;
}

:deep(.v-snackbar__actions) {
  margin-inline-start: 8px;
  padding: 0;
}

.snackbar-action {
  font-weight: 500;
  letter-spacing: 0.1px;
  text-transform: none;
  min-width: 64px;
  height: 36px;
}

/* MD3 颜色调整 */
:deep(.bg-success) {
  background-color: var(--md-primary-container) !important;
  color: var(--md-on-primary-container) !important;
}

:deep(.bg-error) {
  background-color: var(--md-error-container) !important;
  color: var(--md-on-error-container) !important;
}

:deep(.bg-warning) {
  background-color: var(--md-tertiary-container) !important;
  color: var(--md-on-tertiary-container) !important;
}

:deep(.bg-info) {
  background-color: var(--md-secondary-container) !important;
  color: var(--md-on-secondary-container) !important;
}
</style>
