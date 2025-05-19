<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-2">系统设置</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          配置系统界面和基本参数
        </p>

        <!-- 设置卡片 -->
        <v-card rounded="lg" elevation="1" class="mb-6">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" rounded="md">
                <v-icon>mdi-theme-light-dark</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              界面设置
            </v-card-title>
            <v-card-subtitle>自定义系统外观</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="themeMode"
                  :items="themeModeOptions"
                  item-title="text"
                  item-value="value"
                  label="主题模式"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  @update:model-value="updateTheme"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="getThemeIcon()"></v-icon>
                  </template>
                </v-select>
                <p class="text-caption text-medium-emphasis mt-2">
                  当前主题: {{ getCurrentThemeText() }}
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="1" class="mb-6">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="secondary" variant="tonal" rounded="md">
                <v-icon>mdi-api</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              API设置
            </v-card-title>
            <v-card-subtitle>系统接口配置</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="apiBaseUrl"
                  label="API 基础 URL"
                  hint="重启应用后生效"
                  persistent-hint
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  readonly
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-api</v-icon>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="1" class="mb-6">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="info" variant="tonal" rounded="md">
                <v-icon>mdi-information</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              系统信息
            </v-card-title>
            <v-card-subtitle>关于本系统</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="comfortable" class="bg-transparent pa-0">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2"
                        >mdi-information</v-icon
                      >
                    </template>
                    <v-list-item-title>系统名称</v-list-item-title>
                    <v-list-item-subtitle
                      >MoeTrip 旅游景区信息管理系统</v-list-item-subtitle
                    >
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2">mdi-tag</v-icon>
                    </template>
                    <v-list-item-title>版本</v-list-item-title>
                    <v-list-item-subtitle>1.0.0</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2">mdi-update</v-icon>
                    </template>
                    <v-list-item-title>最后更新</v-list-item-title>
                    <v-list-item-subtitle>{{
                      new Date().toLocaleDateString('zh-CN')
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list density="comfortable" class="bg-transparent pa-0">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2">mdi-vuetify</v-icon>
                    </template>
                    <v-list-item-title>前端框架</v-list-item-title>
                    <v-list-item-subtitle
                      >Vue 3 + Vuetify 3</v-list-item-subtitle
                    >
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2">mdi-nodejs</v-icon>
                    </template>
                    <v-list-item-title>后端框架</v-list-item-title>
                    <v-list-item-subtitle
                      >Node.js + Express</v-list-item-subtitle
                    >
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-2">mdi-database</v-icon>
                    </template>
                    <v-list-item-title>数据库</v-list-item-title>
                    <v-list-item-subtitle
                      >PostgreSQL / MySQL</v-list-item-subtitle
                    >
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 待实现功能提示 -->
        <v-card rounded="lg" elevation="1" class="mb-6">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="tertiary" variant="tonal" rounded="md">
                <v-icon>mdi-widgets</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h6 font-weight-bold">
              更多设置
            </v-card-title>
            <v-card-subtitle>即将推出的功能</v-card-subtitle>
          </v-card-item>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <v-alert
              color="info"
              icon="mdi-information-outline"
              variant="tonal"
              density="comfortable"
              rounded="lg"
              class="mb-0"
              border="start"
            >
              <p class="text-subtitle-2 mb-3">
                以下设置功能将在后续版本中实现：
              </p>
              <v-list density="compact" class="bg-transparent pa-0">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      size="26"
                      color="info"
                      variant="tonal"
                      class="mr-2"
                    >
                      <v-icon size="small">mdi-translate</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>多语言设置</v-list-item-title>
                  <v-list-item-subtitle
                    >支持切换多种界面语言</v-list-item-subtitle
                  >
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      size="26"
                      color="info"
                      variant="tonal"
                      class="mr-2"
                    >
                      <v-icon size="small">mdi-email-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>邮件通知配置</v-list-item-title>
                  <v-list-item-subtitle>设置系统邮件提醒</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      size="26"
                      color="info"
                      variant="tonal"
                      class="mr-2"
                    >
                      <v-icon size="small">mdi-security</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>安全选项</v-list-item-title>
                  <v-list-item-subtitle
                    >密码策略与访问控制</v-list-item-subtitle
                  >
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      size="26"
                      color="info"
                      variant="tonal"
                      class="mr-2"
                    >
                      <v-icon size="small">mdi-backup-restore</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>数据备份与恢复</v-list-item-title>
                  <v-list-item-subtitle>系统数据保护机制</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar
                      size="26"
                      color="info"
                      variant="tonal"
                      class="mr-2"
                    >
                      <v-icon size="small">mdi-dots-horizontal</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>更多其他配置项</v-list-item-title>
                  <v-list-item-subtitle>敬请期待</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores';
import AppSnackbar from '../components/AppSnackbar.vue';

// 主题设置
const themeStore = useThemeStore();
const themeMode = ref(themeStore.mode);
const themeModeOptions = [
  { text: '跟随系统', value: 'system' },
  { text: '浅色模式', value: 'light' },
  { text: '深色模式', value: 'dark' },
];

// API设置
const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL || '未设置');

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 初始化
onMounted(() => {
  // 初始化主题
  themeMode.value = themeStore.mode;
});

// 更新主题
function updateTheme() {
  themeStore.setThemeMode(themeMode.value as 'system' | 'dark' | 'light');
  showSuccess('主题设置已更新');
}

// 获取当前主题文本
function getCurrentThemeText() {
  if (themeStore.isDarkMode) {
    return '深色模式';
  } else {
    return '浅色模式';
  }
}

// 获取主题图标
function getThemeIcon() {
  switch (themeMode.value) {
    case 'light':
      return 'mdi-weather-sunny';
    case 'dark':
      return 'mdi-weather-night';
    default:
      return 'mdi-theme-light-dark';
  }
}

// 显示成功消息
function showSuccess(message: string) {
  snackbarText.value = message;
  snackbarColor.value = 'success';
  snackbar.value = true;
}
</script>

<style scoped>
/* 卡片样式 */
.v-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid var(--card-border);
}

/* 主题预览 */
.theme-preview {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.theme-preview.light {
  background-color: #f5f5f5;
  color: #212121;
  border: 1px solid #e0e0e0;
}

.theme-preview.dark {
  background-color: #1e1e1e;
  color: #ffffff;
  border: 1px solid #333333;
}
</style>
