<template>
  <div class="login-page">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center" no-gutters>
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="login-brand-card mb-4" rounded="lg" flat>
            <div class="text-center py-4">
              <h1 class="md-headline-medium text-primary mb-2">萌游旅行</h1>
              <p class="md-body-medium text-medium-emphasis">
                探索世界，记录美好
              </p>
            </div>
          </v-card>

          <AuthForm
            title="用户登录"
            submitText="登录"
            :loading="loading"
            :usernameError="usernameError"
            :passwordError="passwordError"
            :errorMessage="errorMessage"
            @submit="handleLogin"
            @clearError="clearError"
          >
            <template #bottom-actions>
              <p class="md-body-medium">
                还没有账号？
                <router-link to="/register" class="text-primary login-link">
                  立即注册
                </router-link>
              </p>
            </template>
          </AuthForm>
        </v-col>
      </v-row>
    </v-container>

    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
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

const usernameError = ref('');
const passwordError = ref('');
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

// 登录处理函数
const handleLogin = async (data: { username: string; password: string }) => {
  // 清除错误信息
  usernameError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

  const { username, password } = data;

  // 表单验证
  if (!username) {
    usernameError.value = '请输入用户名';
    return;
  }

  if (!password) {
    passwordError.value = '请输入密码';
    return;
  }

  loading.value = true;

  try {
    // 将密码转换为SHA1哈希值
    const passwordHash = CryptoJS.SHA1(password).toString();

    // 调用登录API
    const result = await authApi.login(username, passwordHash);

    // 检查是否请求成功
    if (!result.success) {
      errorMessage.value = result.error || '登录失败，请稍后再试';
      return;
    }

    // 成功登录后处理响应数据
    const response = result.data;

    // 存储用户信息并更新状态
    userStore.setUser({
      id: response.data.user.id,
      username: response.data.user.username,
      role: response.data.user.role,
      token: response.data.token,
    });

    showSuccess('登录成功');

    // 登录成功后重定向到首页或上次访问的页面
    router.push('/');
  } catch (error) {
    // 处理登录错误
    console.error('登录出错:', error);
    errorMessage.value =
      error instanceof Error ? error.message : '登录失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};

// 显示成功消息
const showSuccess = (text: string) => {
  snackbarColor.value = 'success';
  snackbarText.value = text;
  showSnackbar.value = true;
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: var(--md-surface-1);
  position: relative;
}

.login-brand-card {
  background-color: transparent;
}

.login-link {
  color: var(--md-primary);
  font-weight: 500;
  text-decoration: none;
  position: relative;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--md-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-link:hover {
  color: var(--md-primary-container);
}

.login-link:hover::after {
  transform: scaleX(1);
}
</style>
