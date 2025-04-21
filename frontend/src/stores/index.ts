import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as number | null,
    username: null as string | null,
    role: null as string | null,
    token: null as string | null,
    isLoggedIn: false,
  }),

  actions: {
    setUser(userData: {
      id: number;
      username: string;
      role: string;
      token: string;
    }) {
      console.log('Setting user data:', userData);
      this.id = userData.id;
      this.username = userData.username;
      this.role = userData.role;
      this.token = userData.token;
      this.isLoggedIn = true;

      // 存储到本地存储以便页面刷新后恢复
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userRole', userData.role);
    },

    logout() {
      console.log('Logging out user');
      this.id = null;
      this.username = null;
      this.role = null;
      this.token = null;
      this.isLoggedIn = false;

      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
    },

    restoreFromStorage() {
      console.log('Restoring user from storage');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const userRole = localStorage.getItem('userRole');

      console.log('Storage data:', { token, userId, username, userRole });

      if (token && userId && username && userRole) {
        this.id = parseInt(userId);
        this.username = username;
        this.role = userRole;
        this.token = token;
        this.isLoggedIn = true;
        console.log('User restored successfully');
      } else {
        console.log('No user data in storage');
      }
    },
  },

  getters: {
    isAdmin: (state) => state.role === 'admin',
    getToken: (state) => state.token,
  },
});

// 添加主题管理存储
export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 主题模式: 'system'(跟随系统), 'dark'(深色), 'light'(浅色)
    mode: localStorage.getItem('themeMode') || 'system',
  }),

  actions: {
    // 设置主题模式
    setThemeMode(mode: 'system' | 'dark' | 'light') {
      this.mode = mode;
      localStorage.setItem('themeMode', mode);
      this.applyTheme();
    },

    // 应用主题
    applyTheme() {
      const isDarkMode = this.isDarkMode;
      
      // 设置Vuetify主题
      if (typeof document !== 'undefined') {
        // 设置HTML属性以控制Vuetify主题
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        
        // 尝试直接访问Vuetify实例并设置主题（如果可能）
        try {
          const vuetifyInstance = (window as any).__vuetify__;
          if (vuetifyInstance && vuetifyInstance.theme) {
            vuetifyInstance.theme.global.name.value = isDarkMode ? 'dark' : 'light';
          }
        } catch (e) {
          console.warn('无法直接设置Vuetify主题:', e);
        }
      }
    },

    // 初始化主题
    initTheme() {
      this.applyTheme();
      
      // 如果是系统主题模式，添加媒体查询监听器
      if (this.mode === 'system') {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 监听系统主题变化
        const updateTheme = () => {
          this.applyTheme();
        };
        
        darkModeMediaQuery.addEventListener('change', updateTheme);
      }
    }
  },

  getters: {
    // 是否使用深色模式
    isDarkMode(): boolean {
      if (this.mode === 'dark') return true;
      if (this.mode === 'light') return false;
      
      // 系统模式时，检测系统主题
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }
});
