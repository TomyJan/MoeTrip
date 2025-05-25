# MoeTrip旅游景区信息管理系统前端交互实现

## 1. 技术栈概述

MoeTrip旅游景区信息管理系统前端采用现代化的技术栈，主要包括：

- **Vue 3**：采用组合式API（Composition API）作为主要开发模式
- **Vuetify 3**：基于Material Design 3设计规范的UI组件库
- **Pinia**：Vue 3官方推荐的状态管理库，替代Vuex
- **Vue Router 4**：Vue官方路由管理器
- **TypeScript**：提供类型检查和更好的开发体验
- **ECharts**：数据可视化图表库

## 2. Vue 3组件实现

### 2.1 组件结构设计

系统采用了组件化的开发方式，将UI界面拆分为可复用的组件。主要组件包括：

1. **页面级组件**：位于`views`目录，如`Attractions.vue`、`AttractionDetail.vue`等
2. **通用组件**：位于`components`目录，如`AttractionCard.vue`、`AppDialog.vue`等

### 2.2 组合式API使用示例

以`AttractionCard.vue`为例，组件使用组合式API实现：

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { facilityApi } from '../utils/api';
import { useThemeStore } from '../stores';

// 定义属性接口
interface Props {
  attraction: Attraction;
  facilities?: string[];
}

const props = defineProps<Props>();

// 使用状态管理
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

// 定义事件
defineEmits<{
  (e: 'view'): void;
}>();

// 响应式状态
const expanded = ref(false);
const loadingFacilities = ref(false);
const facilities = ref<Facility[]>([]);

// 生命周期钩子
onMounted(() => {
  if (!props.facilities || props.facilities.length === 0) {
    loadFacilities();
  }
});

// 方法定义
async function loadFacilities() {
  // 实现逻辑
}
</script>
```

### 2.3 组件通信方式

1. **Props向下传递**：父组件通过props向子组件传递数据
2. **事件向上传递**：子组件通过emit向父组件发送事件
3. **全局状态管理**：使用Pinia进行跨组件通信

示例：
```vue
<!-- 父组件 -->
<AttractionCard 
  :attraction="attraction" 
  @view="viewAttractionDetail(attraction)" 
/>

<!-- 子组件 -->
<v-card @click="$emit('view')">
  <!-- 内容 -->
</v-card>
```

## 3. Vuetify 3组件实现

### 3.1 Material Design 3主题配置

系统基于Material Design 3设计规范，在`main.ts`中配置了浅色和深色主题：

```typescript
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#6750A4', // MD3 Primary
          'on-primary': '#FFFFFF',
          'primary-container': '#EADDFF',
          // 其他颜色配置...
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#D0BCFF', // MD3 Primary (dark)
          'on-primary': '#381E72',
          'primary-container': '#4F378B',
          // 其他颜色配置...
        },
      },
    },
  },
  locale: {
    locale: 'zhHans',
    messages: { zhHans },
  },
});
```

### 3.2 常用Vuetify组件示例

1. **卡片组件**：

```vue
<v-card
  class="mb-4 attraction-card"
  variant="elevated"
  rounded="lg"
  elevation="1"
>
  <v-img
    :src="attraction.image_url || '/images/new.jpg'"
    height="200px"
    cover
    class="rounded-t-lg"
  ></v-img>
  <v-card-title>{{ attraction.name }}</v-card-title>
  <v-card-text>{{ attraction.description }}</v-card-text>
  <v-card-actions>
    <v-btn variant="text">查看详情</v-btn>
  </v-card-actions>
</v-card>
```

2. **表单组件**：

```vue
<v-text-field
  v-model="searchKeyword"
  label="搜索景点"
  prepend-inner-icon="mdi-magnify"
  hide-details
  density="comfortable"
  variant="outlined"
  bg-color="surface"
  rounded="lg"
  @keyup.enter="loadAttractions"
></v-text-field>
```

3. **对话框组件**：

```vue
<v-dialog v-model="dialog" max-width="500px">
  <v-card>
    <v-card-title>标题</v-card-title>
    <v-card-text>内容</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="dialog = false">确定</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

### 3.3 响应式布局实现

使用Vuetify的栅格系统实现响应式布局：

```vue
<v-container>
  <v-row>
    <v-col cols="12" md="6" lg="4">
      <!-- 内容 -->
    </v-col>
  </v-row>
</v-container>
```

## 4. 事件绑定实现

### 4.1 DOM事件绑定

Vue 3提供了多种事件绑定方式：

```vue
<!-- 基本事件绑定 -->
<v-btn @click="handleClick">点击</v-btn>

<!-- 事件修饰符 -->
<v-btn @click.stop="handleClick">阻止冒泡</v-btn>

<!-- 按键修饰符 -->
<v-text-field @keyup.enter="search"></v-text-field>
```

### 4.2 自定义事件

组件间通过自定义事件通信：

```vue
<!-- 子组件定义事件 -->
<script setup>
defineEmits(['view', 'edit', 'delete']);
</script>

<!-- 父组件监听事件 -->
<AttractionCard
  @view="viewDetails"
  @edit="editItem"
  @delete="deleteItem"
/>
```

### 4.3 事件处理函数

```typescript
// 异步事件处理
const loadAttractions = async () => {
  loading.value = true;
  try {
    const result = await attractionApi.query({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    });
    // 处理结果
  } catch (error) {
    // 错误处理
  } finally {
    loading.value = false;
  }
};

// 路由导航事件
function viewAttractionDetail(attraction: Attraction) {
  router.push(`/attractions/${attraction.id}`);
}
```

## 5. Pinia状态管理

### 5.1 Store定义

系统使用Pinia进行状态管理，主要定义了两个store：

1. **用户状态管理**：

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as number | null,
    username: null as string | null,
    role: null as string | null,
    token: null as string | null,
    isLoggedIn: false,
  }),

  actions: {
    setUser(userData) {
      this.id = userData.id;
      this.username = userData.username;
      this.role = userData.role;
      this.token = userData.token;
      this.isLoggedIn = true;
      // 存储到本地存储
      localStorage.setItem('token', userData.token);
      // 其他存储操作...
    },
    
    logout() {
      this.id = null;
      this.username = null;
      this.role = null;
      this.token = null;
      this.isLoggedIn = false;
      // 清除本地存储
      localStorage.removeItem('token');
      // 其他清除操作...
    },
    
    restoreFromStorage() {
      // 从本地存储恢复用户状态
    }
  },

  getters: {
    isAdmin: (state) => state.role === 'admin',
    getToken: (state) => state.token,
  },
});
```

2. **主题状态管理**：

```typescript
export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem('themeMode') || 'system',
  }),

  actions: {
    setThemeMode(mode) {
      this.mode = mode;
      localStorage.setItem('themeMode', mode);
      this.applyTheme();
    },
    
    applyTheme() {
      // 应用主题逻辑
    },
    
    initTheme() {
      // 初始化主题逻辑
    }
  },

  getters: {
    isDarkMode(): boolean {
      // 判断是否为深色模式
    },
  },
});
```

### 5.2 在组件中使用Store

```vue
<script setup>
import { useUserStore, useThemeStore } from '../stores';

// 获取store实例
const userStore = useUserStore();
const themeStore = useThemeStore();

// 使用状态
const isLoggedIn = computed(() => userStore.isLoggedIn);
const isDarkMode = computed(() => themeStore.isDarkMode);

// 调用actions
function logout() {
  userStore.logout();
  router.push('/login');
}

function toggleTheme() {
  themeStore.setThemeMode(isDarkMode.value ? 'light' : 'dark');
}
</script>
```

### 5.3 持久化状态

系统使用localStorage实现状态持久化：

1. **存储状态**：在actions中将状态保存到localStorage
2. **恢复状态**：在应用启动时从localStorage恢复状态

## 6. 路由管理

### 6.1 路由配置

系统使用Vue Router 4管理路由：

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/attractions',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/attractions',
    name: 'Attractions',
    component: () => import('../views/Attractions.vue'),
  },
  {
    path: '/attractions/:id',
    name: 'AttractionDetail',
    component: () => import('../views/AttractionDetail.vue'),
  },
  // 需要登录权限的路由
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true },
  },
  // 需要管理员权限的路由
  {
    path: '/admin/attractions',
    name: 'AdminAttractions',
    component: () => import('../views/AdminAttractions.vue'),
    meta: { requiresAdmin: true },
  },
  // 其他路由...
];
```

### 6.2 导航守卫

实现路由权限控制：

```typescript
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 需要管理员权限
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'Login' });
  } 
  // 需要登录权限
  else if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } 
  // 正常导航
  else {
    next();
  }
});
```

### 6.3 路由导航

```typescript
// 编程式导航
function viewAttractionDetail(attraction: Attraction) {
  router.push(`/attractions/${attraction.id}`);
}

// 带参数的导航
function goToLogin() {
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath },
  });
}
```

## 7. API交互实现

### 7.1 API请求封装

系统封装了统一的API请求函数：

```typescript
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const userStore = useUserStore();
  const token = userStore.getToken;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 处理响应
    // ...
  } catch (error) {
    // 错误处理
    // ...
  }
}
```

### 7.2 模块化API定义

系统按功能模块定义API：

```typescript
// 景点相关API
export const attractionApi = {
  query: async (params) => {
    return apiRequest('/attraction/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  add: async (attractionData) => {
    return apiRequest('/attraction/add', {
      method: 'POST',
      body: JSON.stringify(attractionData),
    });
  },

  update: async (attractionData) => {
    return apiRequest('/attraction/update', {
      method: 'POST',
      body: JSON.stringify(attractionData),
    });
  },

  delete: async (params) => {
    return apiRequest('/attraction/delete', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
```

### 7.3 在组件中使用API

```typescript
// 获取景点列表
const loadAttractions = async () => {
  loading.value = true;
  try {
    const result = await attractionApi.query({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    });

    if (result.success) {
      attractions.value = result.data.data.attractions;
      totalItems.value = result.data.data.total;
    } else {
      // 处理错误
      showSnackbar.value = true;
      snackbarText.value = result.error || '加载失败';
    }
  } catch (error) {
    // 处理异常
  } finally {
    loading.value = false;
  }
};
```

## 8. 性能优化

### 8.1 组件懒加载

使用动态导入实现组件懒加载：

```typescript
const routes = [
  {
    path: '/attractions',
    name: 'Attractions',
    component: () => import('../views/Attractions.vue'),
  },
];
```

### 8.2 计算属性缓存

使用计算属性缓存派生状态：

```typescript
const isDarkMode = computed(() => themeStore.isDarkMode);
```

### 8.3 性能监控

开启Vue性能监控：

```typescript
// 开发环境启用性能分析
app.config.performance = true;
```

## 9. 主题与样式

### 9.1 Material Design 3主题

系统基于Material Design 3设计规范，实现了浅色和深色主题：

- **浅色主题**：以紫色为主色调，明亮清新
- **深色主题**：深色背景，减少眼睛疲劳

### 9.2 响应式设计

使用Vuetify栅格系统和CSS媒体查询实现响应式设计，适配不同屏幕尺寸：

```vue
<v-row>
  <v-col cols="12" sm="6" md="4" lg="3">
    <!-- 内容 -->
  </v-col>
</v-row>
```

### 9.3 CSS变量应用

使用CSS变量实现主题切换：

```css
.attraction-card {
  background: var(--md-surface);
  border: 1px solid var(--md-outline-variant);
  box-shadow: var(--md-shadow-1);
}
```

## 总结

MoeTrip旅游景区信息管理系统前端采用Vue 3、Vuetify 3和Pinia等现代化技术栈，实现了组件化、响应式的用户界面。通过组合式API和TypeScript，提高了代码的可维护性和类型安全性。Pinia状态管理使得跨组件通信和状态持久化变得简单高效。系统遵循Material Design 3设计规范，提供了美观、一致的用户体验，并支持浅色/深色主题切换。 
