<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from './stores'

const userStore = useUserStore()

onMounted(() => {
  userStore.restoreFromStorage()
})
</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>萌游旅行</v-app-bar-title>
      <v-spacer></v-spacer>
      
      <!-- 未登录状态 -->
      <template v-if="!userStore.isLoggedIn">
        <v-btn to="/attractions" variant="text">景点</v-btn>
        <v-btn to="/login" variant="text">登录</v-btn>
        <v-btn to="/register" variant="text">注册</v-btn>
      </template>
      
      <!-- 已登录状态 -->
      <template v-else>
        <v-btn to="/attractions" variant="text">景点</v-btn>
        
        <!-- 管理员专属 -->
        <v-btn 
          v-if="userStore.isAdmin" 
          to="/admin" 
          variant="text"
          color="error"
        >
          管理中心
        </v-btn>
        
        <!-- 用户菜单 -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              variant="text" 
              v-bind="props"
              class="ml-2"
              prepend-icon="mdi-account-circle"
            >
              {{ userStore.username }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>个人中心</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="userStore.logout()">
              <v-list-item-title>退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer class="d-flex flex-column">
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
  color: #FF0000;
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
  color: #1867C0;
}
</style>
