<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
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
            <p>
              还没有账号？
              <router-link to="/register" class="text-primary">立即注册</router-link>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores'
import { authApi } from '../utils/api'
import CryptoJS from 'crypto-js'
import AuthForm from '../components/AuthForm.vue'
import AppSnackbar from '../components/AppSnackbar.vue'

const router = useRouter()
const userStore = useUserStore()

// 页面加载时检查登录状态
onMounted(() => {
  // 如果用户已登录，重定向到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})

const usernameError = ref('')
const passwordError = ref('')
const errorMessage = ref('')
const loading = ref(false)

// 消息提示
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// 清除错误消息
const clearError = (field: string) => {
  if (field === 'username') {
    usernameError.value = ''
  } else if (field === 'password') {
    passwordError.value = ''
  }
}

// 登录处理函数
const handleLogin = async (data: { username: string, password: string }) => {
  // 清除错误信息
  usernameError.value = ''
  passwordError.value = ''
  errorMessage.value = ''
  
  const { username, password } = data
  
  // 表单验证
  if (!username) {
    usernameError.value = '请输入用户名'
    return
  }
  
  if (!password) {
    passwordError.value = '请输入密码'
    return
  }
  
  loading.value = true
  
  try {
    // 将密码转换为SHA1哈希值
    const passwordHash = CryptoJS.SHA1(password).toString()
    
    // 调用登录API
    const result = await authApi.login(username, passwordHash)
    
    // 检查是否请求成功
    if (!result.success) {
      errorMessage.value = result.error || '登录失败，请稍后再试'
      return
    }
    
    // 成功登录后处理响应数据
    const response = result.data
    
    // 存储用户信息并更新状态
    userStore.setUser({
      id: response.data.user.id,
      username: response.data.user.username,
      role: response.data.user.role,
      token: response.data.token
    })
    
    showSuccess('登录成功')
    
    // 登录成功后重定向到首页或上次访问的页面
    router.push('/')
  } catch (error) {
    // 处理登录错误
    console.error('登录出错:', error)
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

// 显示成功消息
const showSuccess = (text: string) => {
  snackbarColor.value = 'success'
  snackbarText.value = text
  showSnackbar.value = true
}
</script>
