<template>
  <v-dialog v-model="localShow" :max-width="maxWidth" :persistent="persistent">
    <v-card rounded="lg" elevation="3">
      <v-card-title class="text-md-h6">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle" class="pb-2">{{
        subtitle
      }}</v-card-subtitle>

      <v-card-text class="pt-2">
        <slot></slot>
      </v-card-text>

      <v-card-actions v-if="!hideActions" class="d-flex pa-4">
        <v-spacer v-if="alignActionsEnd"></v-spacer>
        <slot name="actions">
          <v-btn
            color="secondary"
            variant="text"
            @click="onCancel"
            rounded="pill"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            class="ml-2"
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
:deep(.v-card) {
  overflow: hidden;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.0178571em;
  font-weight: 500;
}
</style>
