<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <AuthForm
          title="用户注册"
          submitText="注册"
          :loading="loading"
          :usernameError="usernameError"
          :passwordError="passwordError"
          :errorMessage="errorMessage"
          @submit="handleRegister"
          @clearError="clearError"
        >
          <template #additional-fields>
            <v-text-field
              v-model="confirmPassword"
              label="确认密码"
              prepend-icon="mdi-lock-check"
              type="password"
              variant="outlined"
              density="comfortable"
              bg-color="surface-variant"
              rounded="lg"
              class="mb-3"
              :error-messages="confirmPasswordError"
              @input="confirmPasswordError = ''"
              required
            ></v-text-field>
          </template>

          <template #bottom-actions>
            <p>
              已有账号？
              <router-link to="/login" class="text-primary"
                >立即登录</router-link
              >
            </p>
          </template>
        </AuthForm>
      </v-col>
    </v-row>

    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores';
import { authApi } from '../utils/api';
import CryptoJS from 'crypto-js';
import AuthForm from '../components/AuthForm.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

const router = useRouter();
const userStore = useUserStore();

// 页面加载时检查登录状态
onMounted(() => {
  // 如果用户已登录，重定向到首页
  if (userStore.isLoggedIn) {
    router.push('/');
  }
});

const confirmPassword = ref('');
const usernameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const errorMessage = ref('');
const loading = ref(false);

// 消息提示
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 清除错误消息
const clearError = (field: string) => {
  if (field === 'username') {
    usernameError.value = '';
  } else if (field === 'password') {
    passwordError.value = '';
  }
};

// 注册处理函数
const handleRegister = async (data: { username: string; password: string }) => {
  // 清除错误信息
  usernameError.value = '';
  passwordError.value = '';
  confirmPasswordError.value = '';
  errorMessage.value = '';

  const { username, password } = data;

  // 表单验证
  if (!username) {
    usernameError.value = '请输入用户名';
    return;
  }

  if (username.length < 3 || username.length > 20) {
    usernameError.value = '用户名长度应为3-20个字符';
    return;
  }

  if (!password) {
    passwordError.value = '请输入密码';
    return;
  }

  if (password.length < 6) {
    passwordError.value = '密码长度至少为6个字符';
    return;
  }

  if (password !== confirmPassword.value) {
    confirmPasswordError.value = '两次输入的密码不一致';
    return;
  }

  loading.value = true;

  try {
    // 将密码转换为SHA1哈希值
    const passwordHash = CryptoJS.SHA1(password).toString();

    // 调用注册API
    const result = await authApi.register(username, passwordHash);

    // 检查是否请求成功
    if (!result.success) {
      errorMessage.value = result.error || '注册失败，请稍后再试';
      return;
    }

    // 处理注册成功的响应
    const response = result.data;

    // 注册成功后，自动登录
    userStore.setUser({
      id: response.data.user.id,
      username: response.data.user.username,
      role: response.data.user.role,
      token: response.data.token,
    });

    // 显示成功消息
    snackbarText.value = '注册成功，即将跳转到首页';
    snackbarColor.value = 'success';
    showSnackbar.value = true;

    // 注册成功后重定向到首页
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (error) {
    // 处理注册错误
    console.error('注册出错:', error);
    errorMessage.value =
      error instanceof Error ? error.message : '注册失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.v-field__outline) {
  opacity: 0.8;
}

:deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}
</style>
