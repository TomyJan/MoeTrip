<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useUserStore } from './stores'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 判断当前是否为登录或注册页面
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  userStore.restoreFromStorage()
})
</script>

<template>
  <v-app>
    <!-- 在登录或注册页面不显示导航栏 -->
    <v-app-bar app v-if="!isAuthPage" elevation="2">
      <v-app-bar-title class="text-md-h6">萌游旅行</v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-btn to="/attractions" variant="text" rounded="pill" class="ml-2">景点</v-btn>

      <!-- 未登录状态 -->
      <template v-if="!userStore.isLoggedIn">
        <v-btn to="/login" variant="text" rounded="pill" class="ml-2">登录</v-btn>
        <v-btn to="/register" variant="text" rounded="pill" class="ml-2">注册</v-btn>
      </template>
      
      <!-- 已登录状态 -->
      <template v-if="userStore.isLoggedIn">        
        <!-- 管理员专属 -->
        <v-btn 
          v-if="userStore.isAdmin" 
          to="/admin" 
          variant="text"
          rounded="pill"
          color="error"
          class="ml-2"
        >
          管理中心
        </v-btn>
        
        <!-- 用户菜单 -->
        <v-menu
          location="bottom end"
          transition="scale-transition"
          min-width="180"
        >
          <template v-slot:activator="{ props }">
            <v-btn 
              variant="text" 
              v-bind="props"
              class="ml-2 text-none"
              rounded="pill"
              prepend-icon="mdi-account-circle"
            >
              {{ userStore.username }}
              <v-icon end icon="mdi-chevron-down" size="small"></v-icon>
            </v-btn>
          </template>
          <v-card rounded="lg" elevation="3" class="mt-1">
            <v-list bg-color="surface">
              <v-list-item prepend-icon="mdi-account" to="/profile" rounded="lg" density="comfortable">
                <v-list-item-title>个人中心</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item prepend-icon="mdi-logout" @click="handleLogout" rounded="lg" density="comfortable">
                <v-list-item-title>退出登录</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main :class="{ 'auth-main': isAuthPage }">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- 页脚：在登录和注册页面固定在底部，其他页面随页面滚动 -->
    <v-footer class="d-flex flex-column bg-surface" :class="{ 'auth-footer': isAuthPage }">
      <div class="text-center w-100">
        © 2025 MoeTrip
      </div>
      <div class="text-caption text-center w-100">
        Design & Develop by <a href="https://vov.moe/" target="_blank" class="footer-link">TomyJan</a> with <span class="heart-icon">♥</span>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.heart-icon {
  color: var(--md-error);
  font-size: 1.2rem;
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--md-primary);
}

.auth-main {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px); /* 减去页脚和可能的其他元素高度 */
  background-color: var(--md-surface);
}

.auth-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
</style>
