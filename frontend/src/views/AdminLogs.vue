<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">操作日志</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="搜索用户/内容"
          @search="loadLogs"
          class="search-filter-bar"
        >
          <template #filters>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedAction"
                :items="actionOptions"
                item-title="text"
                item-value="value"
                label="操作类型"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="loadLogs"
                clearable
                prepend-inner-icon="mdi-tag"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedTarget"
                :items="targetOptions"
                item-title="text"
                item-value="value"
                label="操作对象"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="loadLogs"
                clearable
                prepend-inner-icon="mdi-database"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <div class="d-flex gap-4">
                <!-- 开始日期选择器 -->
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="formattedStartDate"
                      label="开始日期"
                      prepend-icon="mdi-calendar"
                      readonly
                      class="flex-grow-1 mr-2"
                      v-bind="props"
                      clearable
                      @click:clear="
                        startDate = null;
                        loadLogs();
                      "
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="startDate"
                    @update:model-value="
                      startDateMenu = false;
                      loadLogs();
                    "
                    no-title
                    locale="zh-cn"
                  ></v-date-picker>
                </v-menu>

                <!-- 结束日期选择器 -->
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="formattedEndDate"
                      label="结束日期"
                      prepend-icon="mdi-calendar"
                      readonly
                      class="flex-grow-1 ml-2"
                      v-bind="props"
                      clearable
                      @click:clear="
                        endDate = null;
                        loadLogs();
                      "
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="endDate"
                    @update:model-value="
                      endDateMenu = false;
                      loadLogs();
                    "
                    no-title
                    locale="zh-cn"
                  ></v-date-picker>
                </v-menu>
              </div>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 日志列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="logs"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
            :page="page"
            :items-per-page-options="[10, 20, 50]"
            @update:page="
              page = $event;
              loadLogs();
            "
            @update:items-per-page="
              pageSize = $event;
              page = 1;
              loadLogs();
            "
            :server-items-length="totalLogs || 0"
          >
            <template v-slot:item.user="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary font-weight-medium">{{
                  item.user?.username || '未知用户'
                }}</span>
                <span class="text-caption text-medium-emphasis"
                  >ID: {{ item.user_id }}</span
                >
              </div>
            </template>
            <template v-slot:item.action="{ item }">
              <v-chip
                :color="getActionColor(item.action)"
                size="small"
                variant="tonal"
              >
                {{ item.action }}
              </v-chip>
            </template>
            <template v-slot:item.target="{ item }">
              <div class="text-truncate" style="max-width: 80px">
                {{ getTargetText(item.target) }}
              </div>
            </template>
            <template v-slot:item.content="{ item }">
              <div class="text-truncate" style="max-width: 200px">
                {{ formatContent(item.content) }}
              </div>
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ formatDateTime(item.created_at) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-tooltip text="查看详情" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      density="comfortable"
                      variant="text"
                      color="info"
                      @click="viewLogDetail(item)"
                      rounded="pill"
                      class="action-btn"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 日志详情对话框 -->
    <AppDialog
      v-model:show="detailDialog"
      title="日志详情"
      :loading="loadingDetail"
      hideActions
      :max-width="600"
    >
      <v-card v-if="selectedLog" flat class="detail-card">
        <v-card-text>
          <div class="d-flex flex-wrap justify-space-between mb-4">
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">操作用户</p>
              <p class="mb-0">
                {{ selectedLog.user?.username || '未知用户' }} (ID:
                {{ selectedLog.user_id }})
              </p>
            </div>
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">操作类型</p>
              <v-chip
                :color="getActionColor(selectedLog.action)"
                size="small"
                rounded="pill"
              >
                {{ getActionText(selectedLog.action) }}
              </v-chip>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <div class="d-flex flex-wrap justify-space-between mb-4">
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">操作对象</p>
              <p class="mb-0">
                {{ getTargetText(selectedLog.target) }}
                <span v-if="selectedLog.target_id"
                  >(ID: {{ selectedLog.target_id }})</span
                >
              </p>
            </div>
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">操作时间</p>
              <p class="mb-0">{{ formatDateTime(selectedLog.created_at) }}</p>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <p class="text-subtitle-1 font-weight-bold mb-2">IP地址</p>
          <p class="mb-3">{{ selectedLog.ip_address || '未知' }}</p>

          <p class="text-subtitle-1 font-weight-bold mb-2">浏览器信息</p>
          <p class="mb-3">{{ selectedLog.user_agent || '未知' }}</p>

          <p class="text-subtitle-1 font-weight-bold mb-2">操作内容</p>
          <v-card variant="outlined" class="mb-4 info-card">
            <v-card-text>
              <pre class="log-content">{{
                formatDetailContent(selectedLog.content)
              }}</pre>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>

      <!-- 对话框底部按钮 -->
      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          variant="text"
          @click="detailDialog = false"
          rounded="pill"
        >
          关闭
        </v-btn>
      </div>
    </AppDialog>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { logApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

// 日志类型定义
interface Log {
  id: number;
  user_id: number;
  action: string;
  target: string;
  target_id?: number;
  content: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// 表格列定义
const headers = [
  { title: '用户', key: 'user', sortable: true },
  { title: '操作', key: 'action', sortable: true },
  { title: '对象', key: 'target_info', sortable: true },
  { title: '内容', key: 'content', sortable: true },
  { title: '时间', key: 'created_at', sortable: true },
  {
    title: '操作',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: '80px',
  },
];

// 状态变量
const logs = ref<Log[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalLogs = ref(0);
const searchKeyword = ref('');
const selectedAction = ref<string | null>(null);
const selectedTarget = ref<string | null>(null);

// 日期选择相关
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const startDateMenu = ref(false);
const endDateMenu = ref(false);

// 格式化日期显示
const formattedStartDate = computed(() =>
  startDate.value ? formatDate(startDate.value) : '',
);
const formattedEndDate = computed(() =>
  endDate.value ? formatDate(endDate.value) : '',
);

// 操作类型选项
const actionOptions = [
  { text: '创建', value: 'create' },
  { text: '更新', value: 'update' },
  { text: '删除', value: 'delete' },
  { text: '查询', value: 'query' },
  { text: '登录', value: 'login' },
  { text: '登出', value: 'logout' },
  { text: '注册', value: 'register' },
  { text: '取消', value: 'cancel' },
  { text: '系统', value: 'system' },
  { text: '其他', value: 'other' },
];

// 操作对象选项
const targetOptions = [
  { text: '用户', value: 'user' },
  { text: '景点', value: 'attraction' },
  { text: '设施', value: 'facility' },
  { text: '票种', value: 'ticket' },
  { text: '订单', value: 'order' },
  { text: '反馈', value: 'feedback' },
  { text: '日志', value: 'log' },
  { text: '支付', value: 'payment' },
  { text: '统计', value: 'stats' },
  { text: '系统', value: 'system' },
];

// 日志详情对话框
const detailDialog = ref(false);
const selectedLog = ref<Log | null>(null);
const loadingDetail = ref(false);

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(() => {
  loadLogs();
});

// 加载日志列表
async function loadLogs() {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    };

    // 添加日期范围筛选（确保使用YYYY-MM-DD格式）
    if (startDate.value) {
      params.startDate = formatDateForApi(startDate.value);
    }
    if (endDate.value) {
      params.endDate = formatDateForApi(endDate.value);
    }

    // 添加操作类型筛选
    if (selectedAction.value) {
      params.action = selectedAction.value;
    }

    // 添加操作对象筛选
    if (selectedTarget.value) {
      params.target = selectedTarget.value;
    }

    // 添加搜索关键词
    // 注意：后端API目前不支持按关键词搜索日志，这里只是前端过滤
    // 未来可以扩展后端API支持按内容或用户名搜索

    console.log('查询日志参数:', params);

    const result = await logApi.query(params);

    if (result.success && result.data?.data) {
      console.log('日志查询结果:', result.data.data);
      logs.value = result.data.data.logs || [];
      totalLogs.value = result.data.data.total || 0;

      // 如果有搜索关键词，前端过滤
      if (searchKeyword.value) {
        logs.value = logs.value.filter((log) => {
          // 匹配用户名
          const usernameMatch = log.user?.username
            ?.toLowerCase()
            .includes(searchKeyword.value.toLowerCase());
          // 匹配内容
          const contentMatch = log.content
            .toLowerCase()
            .includes(searchKeyword.value.toLowerCase());
          return usernameMatch || contentMatch;
        });
      }
    } else {
      showError(result.error || '加载日志列表失败');
    }
  } catch (error) {
    console.error('加载日志列表失败:', error);
    showError(
      '加载日志列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
}

// 获取操作类型文本
function getActionText(action: string): string {
  const option = actionOptions.find((opt) => opt.value === action);
  if (option) return option.text;

  // 尝试通用映射
  switch (action) {
    case 'init':
      return '初始化';
    case 'buy':
      return '购买';
    case 'pay':
      return '支付';
    case 'check':
      return '检查';
    case 'stats':
      return '统计';
    default:
      return action;
  }
}

// 获取操作类型颜色
function getActionColor(action: string): string {
  switch (action) {
    case 'create':
    case 'register':
      return 'success';
    case 'update':
    case 'pay':
      return 'info';
    case 'delete':
    case 'cancel':
      return 'error';
    case 'query':
    case 'check':
    case 'stats':
      return 'purple';
    case 'login':
    case 'logout':
      return 'primary';
    case 'buy':
      return 'amber-darken-2';
    case 'init':
    case 'system':
      return 'grey';
    default:
      return 'grey';
  }
}

// 获取操作对象文本
function getTargetText(target: string): string {
  const option = targetOptions.find((opt) => opt.value === target);
  if (option) return option.text;

  // 尝试通用映射
  switch (target) {
    case 'admin':
      return '管理员';
    case 'api':
      return 'API接口';
    case 'file':
      return '文件';
    case 'config':
      return '配置';
    case 'report':
      return '报表';
    // 处理复数形式
    case 'users':
      return '用户';
    case 'attractions':
      return '景点';
    case 'facilities':
      return '设施';
    case 'tickets':
      return '票种';
    case 'orders':
      return '订单';
    case 'feedbacks':
      return '反馈';
    case 'logs':
      return '日志';
    default:
      return target;
  }
}

// 格式化日期为YYYY-MM-DD格式（用于API调用）
function formatDateForApi(dateStr: string): string {
  if (!dateStr) return '';

  // 如果已经是YYYY-MM-DD格式，直接返回
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // 否则格式化为YYYY-MM-DD
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化日期为更友好的显示格式（用于UI显示）
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

// 格式化日期时间
function formatDateTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('zh-CN') +
    ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );
}

// 格式化内容（表格显示）
function formatContent(content: string): string {
  // 尝试解析JSON
  try {
    const obj = JSON.parse(content);
    // 如果是对象，返回简化版本
    if (typeof obj === 'object' && obj !== null) {
      // 尝试生成更有意义的摘要
      const summary = generateSummary(obj);
      if (summary) {
        return summary;
      }

      // 如无法生成摘要，则截取前50个字符
      return (
        JSON.stringify(obj).substring(0, 50) +
        (JSON.stringify(obj).length > 50 ? '...' : '')
      );
    }
  } catch (e) {
    // 不是JSON，直接返回文本
  }

  // 纯文本，截取前50个字符
  return content.substring(0, 50) + (content.length > 50 ? '...' : '');
}

// 为操作内容生成摘要
function generateSummary(obj: any): string | null {
  // 如果有method和path，说明是通过中间件记录的API操作
  if (obj.method && obj.path) {
    let summary = `${obj.method} ${obj.path}`;

    // 如果有请求体，添加一些重要字段的摘要
    if (obj.body) {
      const keys = Object.keys(obj.body).filter(
        (k) =>
          k !== 'password' &&
          k !== 'token' &&
          k !== 'password_hash' &&
          obj.body[k] !== '[REDACTED]',
      );

      if (keys.length > 0) {
        // 最多显示3个字段
        const displayKeys = keys.slice(0, 3);
        const bodyStr = displayKeys
          .map((k) => {
            const val = obj.body[k];
            if (typeof val === 'object') return `${k}: {...}`;
            return `${k}: ${String(val).substring(0, 15)}${String(val).length > 15 ? '...' : ''}`;
          })
          .join(', ');

        summary += ` (${bodyStr}${keys.length > 3 ? ', ...' : ''})`;
      }
    }

    return summary;
  }

  // 注册/登录的特殊处理
  if (obj.username && obj.role) {
    return `用户: ${obj.username}, 角色: ${obj.role}`;
  }

  // 处理可能包含名称的对象
  if (obj.name) {
    let summary = `名称: ${obj.name}`;
    if (obj.price) summary += `, 价格: ${obj.price}`;
    if (obj.status) summary += `, 状态: ${obj.status}`;
    return summary;
  }

  return null;
}

// 格式化内容（详情显示）
function formatDetailContent(content: string): string {
  // 尝试解析JSON并格式化
  try {
    const obj = JSON.parse(content);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    // 不是JSON，直接返回
    return content;
  }
}

// 查看日志详情
function viewLogDetail(log: Log) {
  selectedLog.value = log;
  detailDialog.value = true;
}

// 显示错误消息
function showError(message: string) {
  snackbarText.value = message;
  snackbarColor.value = 'error';
  snackbar.value = true;
}
</script>

<style scoped>
/* 表格样式 */
.v-data-table :deep(th) {
  font-weight: 600 !important;
  white-space: nowrap;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 0 16px !important;
}

/* 卡片样式 */
.v-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid var(--card-border);
  background: var(--md-surface);
}

/* 筛选区域样式 */
.search-filter-bar {
  margin-bottom: 16px;
}

/* 日期选择器间距 */
.gap-4 {
  gap: 16px;
}

/* 状态标签 */
.v-chip {
  font-weight: 500;
}

/* 按钮样式统一 */
.v-btn {
  text-transform: none;
  letter-spacing: 0.0178571em;
  font-weight: 500;
}

/* 操作按钮样式 */
.action-btn {
  margin: 0 2px;
}

/* 详情区域样式 */
.text-subtitle-1.font-weight-bold {
  font-size: 0.875rem;
  line-height: 1.375rem;
  font-weight: 600 !important;
  color: var(--v-theme-on-surface);
}

/* 订单详情卡片样式 */
.detail-card {
  border-radius: 8px;
}

.info-card {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.03);
}

.info-item {
  min-width: 120px;
}

/* 内容单元格 */
.content-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 日志详情内容样式 */
.log-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  padding: 0;
}
</style>
