<template>
  <v-card class="elevation-3" rounded="lg">
    <v-card-title class="text-center py-5">
      <h2 class="text-md-h5 font-weight-medium">{{ title }}</h2>
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          label="用户名"
          prepend-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          bg-color="surface-variant"
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
          class="mb-3"
          bg-color="surface-variant"
          rounded="lg"
          :error-messages="passwordError"
          @input="clearError('password')"
          required
        ></v-text-field>

        <slot name="additional-fields"></slot>

        <v-alert
          v-if="errorMessage"
          type="error"
          class="mt-4 mb-3"
          variant="tonal"
          rounded="lg"
          border
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
            elevation="2"
          >
            {{ submitText }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-5">
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
/* MD3 样式增强 */
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.0178571em;
  font-weight: 500;
}

:deep(.v-btn--disabled) {
  opacity: 0.38;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field__outline) {
  opacity: 0.8;
}

:deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}
</style>
