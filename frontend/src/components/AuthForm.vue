<template>
  <v-card class="auth-card" rounded="lg" elevation="1">
    <v-card-title class="text-center py-5">
      <h2 class="md-headline-small font-weight-medium">{{ title }}</h2>
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          label="用户名"
          prepend-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          bg-color="surface"
          rounded="lg"
          :error-messages="usernameError"
          @input="clearError('username')"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="密码"
          prepend-icon="mdi-lock"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          bg-color="surface"
          rounded="lg"
          :error-messages="passwordError"
          @input="clearError('password')"
          required
        ></v-text-field>

        <slot name="additional-fields"></slot>

        <v-alert
          v-if="errorMessage"
          type="error"
          class="mt-5 mb-4"
          variant="tonal"
          rounded="lg"
          border="start"
          density="comfortable"
        >
          {{ errorMessage }}
        </v-alert>

        <div class="d-flex justify-center mt-6">
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
            size="large"
            rounded="pill"
            min-width="120"
            min-height="48"
            variant="elevated"
          >
            {{ submitText }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-5 pt-2">
      <slot name="bottom-actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  submitText: string;
  loading?: boolean;
  initialUsername?: string;
  initialPassword?: string;
  usernameError?: string;
  passwordError?: string;
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialUsername: '',
  initialPassword: '',
  usernameError: '',
  passwordError: '',
  errorMessage: '',
});

const emit = defineEmits<{
  (e: 'submit', data: { username: string; password: string }): void;
  (e: 'clearError', field: string): void;
}>();

const username = ref(props.initialUsername);
const password = ref(props.initialPassword);

function onSubmit() {
  emit('submit', { username: username.value, password: password.value });
}

function clearError(field: string) {
  emit('clearError', field);
}
</script>

<style scoped>
.auth-card {
  border: 1px solid var(--md-outline-variant);
  background-color: var(--md-surface);
  box-shadow: var(--md-shadow-1);
  overflow: hidden;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 450px;
  margin: 0 auto;
}

/* MD3 样式增强 */
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.0178571em;
  font-weight: 500;
  height: 40px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn:hover) {
  box-shadow: var(--md-shadow-2);
}

:deep(.v-btn--disabled) {
  opacity: 0.38;
}

:deep(.v-field) {
  border-radius: 12px;
  background-color: var(--md-surface-variant);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-field__outline) {
  opacity: 0.8;
  color: var(--md-outline);
}

:deep(.v-field--focused) {
  background-color: var(--md-surface-1);
}

:deep(.v-field--focused .v-field__outline) {
  opacity: 1;
  color: var(--md-primary);
}

:deep(.v-field--error .v-field__outline) {
  color: var(--md-error) !important;
}

:deep(.v-field .v-icon) {
  color: var(--md-on-surface-variant);
}

:deep(.v-field--focused .v-icon) {
  color: var(--md-primary);
}

:deep(.v-label) {
  font-size: 14px;
  color: var(--md-on-surface-variant);
}

:deep(.v-field--focused .v-label) {
  color: var(--md-primary);
}

:deep(.v-field__input) {
  font-size: 16px;
  color: var(--md-on-surface);
  padding: 8px 12px;
}
</style>
