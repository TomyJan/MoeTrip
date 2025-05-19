<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useUserStore, useThemeStore } from './stores';
import { useRouter, useRoute } from 'vue-router';
import { authApi } from './utils/api';

const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();

// 抽屉导航状态
const drawer = ref(false);

// 登出加载状态
const logoutLoading = ref(false);

// 判断当前是否为登录或注册页面
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

// 当前是否为深色模式
const isDarkMode = computed(() => themeStore.isDarkMode);

const handleLogout = async () => {
  logoutLoading.value = true;
  
  try {
    // 如果用户已登录，则调用登出API
    if (userStore.isLoggedIn && userStore.token) {
      await authApi.logout();
    }
  } catch (error) {
    console.error('登出API调用失败:', error);
  } finally {
    // 无论API调用是否成功，都执行本地登出操作
    userStore.logout();
    drawer.value = false; // 关闭抽屉
    router.push('/');
    logoutLoading.value = false;
  }
};

// 主题模式文本映射
const themeModeText = {
  system: '跟随系统',
  dark: '深色模式',
  light: '浅色模式',
};

// 获取当前主题模式的文本
const currentThemeModeText = computed(
  () => themeModeText[themeStore.mode as keyof typeof themeModeText],
);

// 切换主题模式
const setThemeMode = (mode: 'system' | 'dark' | 'light') => {
  themeStore.setThemeMode(mode);
};

onMounted(() => {
  userStore.restoreFromStorage();
  themeStore.initTheme();
});
</script>

<template>
  <v-app :theme="isDarkMode ? 'dark' : 'light'">
    <!-- 在登录或注册页面不显示导航栏 -->
    <v-app-bar
      v-if="!isAuthPage"
      elevation="0"
      color="surface"
      class="app-bar"
      flat
    >
      <!-- 移动端汉堡菜单按钮 -->
      <v-app-bar-nav-icon
        class="d-md-none"
        @click="drawer = !drawer"
        aria-label="菜单"
      ></v-app-bar-nav-icon>

      <v-app-bar-title class="md-title-large">萌游旅行</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- 桌面端导航链接 -->
      <v-btn
        to="/attractions"
        variant="text"
        rounded="pill"
        class="ml-2 d-none d-md-flex nav-btn"
        >景点</v-btn
      >

      <!-- 未登录状态 -->
      <template v-if="!userStore.isLoggedIn">
        <v-btn 
          to="/login" 
          variant="text" 
          rounded="pill" 
          class="ml-2 d-none d-md-flex nav-btn"
          >登录</v-btn
        >
        <v-btn 
          to="/register" 
          variant="elevated" 
          rounded="pill" 
          color="primary"
          class="ml-2 d-none d-md-flex nav-btn"
        >
          注册
        </v-btn>
      </template>

      <!-- 已登录状态 - 桌面端 -->
      <template v-if="userStore.isLoggedIn">
        <!-- 管理员专属 -->
        <v-btn
          v-if="userStore.isAdmin"
          to="/admin"
          variant="tonal"
          rounded="pill"
          color="error"
          class="ml-2 d-none d-md-flex nav-btn"
        >
          管理中心
        </v-btn>

        <!-- 用户菜单 -->
        <v-menu
          location="bottom end"
          transition="scale-transition"
          min-width="200"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="ml-2 text-none nav-btn"
              rounded="pill"
            >
              <v-icon start>mdi-account-circle</v-icon>
              {{ userStore.username }}
              <v-icon end size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card rounded="lg" elevation="2" class="mt-1 user-menu">
            <v-list bg-color="surface">
              <v-list-item
                prepend-icon="mdi-account"
                to="/profile"
                rounded="lg"
                density="comfortable"
              >
                <v-list-item-title>个人中心</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="userStore.isAdmin && $vuetify.display.smAndDown"
                prepend-icon="mdi-shield-account"
                to="/admin"
                rounded="lg"
                density="comfortable"
              >
                <v-list-item-title>管理中心</v-list-item-title>
              </v-list-item>
              <v-divider class="mx-3 my-2"></v-divider>
              <v-list-item
                prepend-icon="mdi-logout"
                @click="handleLogout"
                rounded="lg"
                density="comfortable"
                :disabled="logoutLoading"
              >
                <v-list-item-title>
                  <span v-if="!logoutLoading">退出登录</span>
                  <v-progress-circular v-else indeterminate size="20" width="2" class="mr-2"></v-progress-circular>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <!-- 主题切换按钮 -->
      <v-menu
        location="bottom end"
        transition="scale-transition"
        min-width="200"
        class="d-none d-md-block"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            v-bind="props"
            class="ml-2 nav-btn d-none d-md-flex"
            icon
            rounded="pill"
            min-width="36"
          >
            <v-icon>
              {{
                themeStore.isDarkMode
                  ? 'mdi-weather-night'
                  : 'mdi-weather-sunny'
              }}
            </v-icon>
            <v-tooltip activator="parent" location="bottom">
              主题设置 (当前: {{ currentThemeModeText }})
            </v-tooltip>
          </v-btn>
        </template>
        <v-card rounded="lg" elevation="2" class="mt-1 theme-menu">
          <v-list bg-color="surface">
            <v-list-item
              @click="setThemeMode('system')"
              :active="themeStore.mode === 'system'"
              rounded="lg"
              prepend-icon="mdi-theme-light-dark"
            >
              <v-list-item-title>跟随系统</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="setThemeMode('light')"
              :active="themeStore.mode === 'light'"
              rounded="lg"
              prepend-icon="mdi-weather-sunny"
            >
              <v-list-item-title>浅色模式</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="setThemeMode('dark')"
              :active="themeStore.mode === 'dark'"
              rounded="lg"
              prepend-icon="mdi-weather-night"
            >
              <v-list-item-title>深色模式</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- 移动端导航抽屉 -->
    <v-navigation-drawer
      v-if="!isAuthPage"
      v-model="drawer"
      temporary
      location="left"
      width="280"
      class="mobile-drawer"
      elevation="4"
    >
      <v-list>
        <v-list-item class="mb-2 mt-2">
          <v-list-item-title class="text-h6">萌游旅行</v-list-item-title>
        </v-list-item>
        
        <v-divider class="mb-2"></v-divider>
        
        <!-- 导航链接 -->
        <v-list-item
          to="/attractions"
          prepend-icon="mdi-map-marker"
          rounded="lg"
          :active="route.path === '/attractions'"
        >
          <v-list-item-title>景点</v-list-item-title>
        </v-list-item>
        
        <!-- 登录/注册链接 (未登录状态) -->
        <template v-if="!userStore.isLoggedIn">
          <v-list-item
            to="/login"
            prepend-icon="mdi-login"
            rounded="lg"
            :active="route.path === '/login'"
          >
            <v-list-item-title>登录</v-list-item-title>
          </v-list-item>
          
          <v-list-item
            to="/register"
            prepend-icon="mdi-account-plus"
            rounded="lg"
            :active="route.path === '/register'"
          >
            <v-list-item-title>注册</v-list-item-title>
          </v-list-item>
        </template>
        
        <v-divider class="my-2"></v-divider>
        
        <!-- 主题设置 -->
        <v-list-subheader>主题设置</v-list-subheader>
        <v-list-item
          @click="setThemeMode('system')"
          prepend-icon="mdi-theme-light-dark"
          rounded="lg"
          :active="themeStore.mode === 'system'"
        >
          <v-list-item-title>跟随系统</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="setThemeMode('light')"
          prepend-icon="mdi-weather-sunny"
          rounded="lg"
          :active="themeStore.mode === 'light'"
        >
          <v-list-item-title>浅色模式</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="setThemeMode('dark')"
          prepend-icon="mdi-weather-night"
          rounded="lg"
          :active="themeStore.mode === 'dark'"
        >
          <v-list-item-title>深色模式</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main :class="{ 'auth-main': isAuthPage }">
      <router-view />
    </v-main>

    <!-- 页脚：在登录和注册页面固定在底部，其他页面随页面滚动 -->
    <v-footer
      class="d-flex flex-column bg-surface"
      :class="{ 'auth-footer': isAuthPage }"
      elevation="0"
      color="surface"
    >
      <div class="text-center w-100 md-body-medium">© 2025 MoeTrip</div>
      <div class="text-caption text-center w-100 md-body-small">
        Design & Develop by
        <a href="https://vov.moe/" target="_blank" class="footer-link"
          >TomyJan</a
        >
        with <span class="heart-icon">♥</span>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app-bar {
  border-bottom: 1px solid var(--md-outline-variant);
}

.nav-btn {
  position: relative;
  font-weight: 500;
  letter-spacing: 0.0178571em;
  text-transform: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: currentColor;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-btn:hover::before {
  opacity: 0.08;
}

.nav-btn:active::before {
  opacity: 0.12;
}

.heart-icon {
  color: var(--md-error);
  font-size: 1.2rem;
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

.footer-link {
  color: var(--md-primary);
  text-decoration: none;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.footer-link:hover {
  color: var(--md-primary-container);
}

.footer-link::after {
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

.footer-link:hover::after {
  transform: scaleX(1);
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

.user-menu, .theme-menu {
  overflow: hidden;
  box-shadow: var(--md-shadow-2);
  border: 1px solid var(--md-outline-variant);
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-drawer {
  background-color: var(--md-surface);
  border-right: 1px solid var(--md-outline-variant);
}

:deep(.v-list-item) {
  min-height: 48px;
  border-radius: 28px;
  margin: 4px 8px;
  position: relative;
  overflow: hidden;
}

:deep(.v-list-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: currentColor;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

:deep(.v-list-item:hover::before) {
  opacity: 0.08;
}

:deep(.v-list-item--active) {
  background-color: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

:deep(.v-list-item--active .v-icon) {
  color: var(--md-on-primary-container);
}

/* 抽屉的标题样式 */
:deep(.v-navigation-drawer__content) {
  padding: 8px;
}

:deep(.v-list-subheader) {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: var(--md-on-surface-variant);
}
</style>
