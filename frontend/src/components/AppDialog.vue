<template>
  <v-dialog 
    v-model="localShow" 
    :max-width="maxWidth" 
    :persistent="persistent"
    transition="dialog-bottom-transition"
    class="md3-dialog"
  >
    <v-card rounded="lg" elevation="2" class="dialog-card">
      <v-card-title class="md-headline-small py-4">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle" class="pb-2 md-body-medium">
        {{ subtitle }}
      </v-card-subtitle>

      <v-card-text class="pt-3 md-body-medium">
        <slot></slot>
      </v-card-text>

      <v-card-actions v-if="!hideActions" class="dialog-actions">
        <v-spacer v-if="alignActionsEnd"></v-spacer>
        <slot name="actions">
          <v-btn
            color="secondary"
            variant="text"
            @click="onCancel"
            rounded="pill"
            class="dialog-btn"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            v-if="!hideConfirm"
            :color="confirmColor || 'primary'"
            variant="elevated"
            class="ml-3 dialog-btn"
            :loading="loading"
            @click="onConfirm"
            rounded="pill"
          >
            {{ confirmText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  show: boolean;
  title: string;
  subtitle?: string;
  maxWidth?: string | number;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
  persistent?: boolean;
  alignActionsEnd?: boolean;
  hideActions?: boolean;
  hideConfirm?: boolean;
  confirmColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  maxWidth: 500,
  cancelText: '取消',
  confirmText: '确认',
  loading: false,
  persistent: false,
  alignActionsEnd: true,
  hideActions: false,
  hideConfirm: false,
  confirmColor: 'primary',
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();

const localShow = ref(props.show);

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

function onCancel() {
  emit('cancel');
  localShow.value = false;
}

function onConfirm() {
  emit('confirm');
}
</script>

<style scoped>
.md3-dialog :deep(.v-overlay__content) {
  box-shadow: var(--md-shadow-3);
  border-radius: 28px;
  transition: all var(--md-duration-medium2) var(--md-motion-emphasized-decelerate);
}

.dialog-card {
  overflow: hidden;
  border: 1px solid var(--md-outline-variant);
  background-color: var(--md-surface);
  box-shadow: var(--md-shadow-2);
  transition: all var(--md-duration-medium1) var(--md-motion-standard);
}

.dialog-card :deep(.v-card-title) {
  color: var(--md-on-surface);
  font-weight: 400;
  letter-spacing: 0;
}

.dialog-card :deep(.v-card-subtitle) {
  color: var(--md-on-surface-variant);
  letter-spacing: 0.25px;
}

.dialog-card :deep(.v-card-text) {
  color: var(--md-on-surface);
}

.dialog-actions {
  padding: 16px 24px 24px;
}

.dialog-btn {
  position: relative;
  min-width: 80px;
  height: 40px;
  font-weight: 500;
  letter-spacing: 0.0178571em;
  text-transform: none;
  transition: all var(--md-duration-short4) var(--md-motion-standard);
  overflow: hidden;
}

.dialog-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: currentColor;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--md-duration-short4) var(--md-motion-standard);
  pointer-events: none;
}

.dialog-btn:hover::before {
  opacity: var(--md-state-hover-opacity);
}

.dialog-btn:active::before {
  opacity: var(--md-state-pressed-opacity);
}

.dialog-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--md-shadow-1);
}
</style>
