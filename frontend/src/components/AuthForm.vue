<template>
  <v-card class="elevation-12">
    <v-card-title class="text-center py-4">
      <h2>{{ title }}</h2>
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          label="用户名"
          prepend-icon="mdi-account"
          variant="outlined"
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
          :error-messages="passwordError"
          @input="clearError('password')"
          required
        ></v-text-field>
        
        <slot name="additional-fields"></slot>
        
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mt-3"
          density="compact"
        >
          {{ errorMessage }}
        </v-alert>
        
        <div class="d-flex justify-center mt-4">
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
            min-width="120"
          >
            {{ submitText }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
    
    <v-card-actions class="justify-center pb-4">
      <slot name="bottom-actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  submitText: string
  loading?: boolean
  initialUsername?: string
  initialPassword?: string
  usernameError?: string
  passwordError?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialUsername: '',
  initialPassword: '',
  usernameError: '',
  passwordError: '',
  errorMessage: ''
})

const emit = defineEmits<{
  (e: 'submit', data: { username: string, password: string }): void
  (e: 'clearError', field: string): void
}>()

const username = ref(props.initialUsername)
const password = ref(props.initialPassword)

function onSubmit() {
  emit('submit', { username: username.value, password: password.value })
}

function clearError(field: string) {
  emit('clearError', field)
}
</script>
