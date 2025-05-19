<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">订单管理</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="订单号/用户ID"
          @search="loadOrders"
          class="search-filter-bar"
        >
          <template #filters>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedAttraction"
                :items="attractionOptions"
                item-title="name"
                item-value="id"
                label="选择景点"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="loadOrders"
                clearable
                prepend-inner-icon="mdi-map-marker"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                item-title="text"
                item-value="value"
                label="订单状态"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="loadOrders"
                clearable
                prepend-inner-icon="mdi-tag"
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
                        loadOrders();
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
                      loadOrders();
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
                        loadOrders();
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
                      loadOrders();
                    "
                    no-title
                    locale="zh-cn"
                  ></v-date-picker>
                </v-menu>
              </div>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 订单列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="orders"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
            :page="page"
            :items-per-page-options="[10, 20, 50]"
            @update:page="page = $event; loadOrders()"
            @update:items-per-page="pageSize = $event; page = 1; loadOrders()"
            :server-items-length="totalOrders || 0"
          >
            <template v-slot:item.order_id="{ item }">
              <span class="font-weight-medium">{{ item.order_id }}</span>
            </template>
            <template v-slot:item.total_price="{ item }">
              <span class="text-primary font-weight-medium"
                >¥{{ item.total_price.toFixed(2) }}</span
              >
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                rounded="pill"
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>
            <template v-slot:item.ticket_info="{ item }">
              <div class="d-flex flex-column">
                <span>{{ item.ticket_name }}</span>
                <span class="text-caption text-medium-emphasis">{{
                  item.attraction_name
                }}</span>
              </div>
            </template>
            <template v-slot:item.date="{ item }">
              {{ formatDate(item.date) }}
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
                      @click="viewOrderDetail(item)"
                      rounded="pill"
                      class="action-btn"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="修改状态" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      density="comfortable"
                      variant="text"
                      color="blue"
                      @click="openChangeStatusDialog(item)"
                      rounded="pill"
                      :disabled="
                        item.status === 'cancelled' ||
                        item.status === 'completed'
                      "
                      class="action-btn"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>
          
          <!-- 空状态 -->
          <div v-if="!loading && (!orders.length || orders.length === 0)" class="text-center py-8">
            <div class="empty-state">
              <v-icon icon="mdi-cart-outline" size="large" color="outline" class="mb-3"></v-icon>
              <p class="md-body-large text-medium-emphasis">暂无订单数据</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 订单详情对话框 -->
    <AppDialog
      v-model:show="detailDialog"
      title="订单详情"
      :loading="loadingDetail"
      hideActions
      @cancel="detailDialog = false"
      :max-width="600"
    >
      <v-card v-if="selectedOrder" flat class="detail-card">
        <v-card-text>
          <div class="d-flex flex-wrap justify-space-between mb-4">
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">订单号</p>
              <p class="mb-0">{{ selectedOrder.order_id }}</p>
            </div>
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">状态</p>
              <v-chip
                :color="getStatusColor(selectedOrder.status)"
                size="small"
                rounded="pill"
              >
                {{ getStatusText(selectedOrder.status) }}
              </v-chip>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <div class="d-flex flex-wrap justify-space-between mb-4">
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">购买用户</p>
              <p class="mb-0">ID: {{ selectedOrder.user_id }}</p>
            </div>
            <div class="info-item">
              <p class="text-subtitle-1 font-weight-bold mb-1">下单时间</p>
              <p class="mb-0">{{ formatDateTime(selectedOrder.created_at) }}</p>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <p class="text-subtitle-1 font-weight-bold mb-2">票种信息</p>
          <v-card variant="outlined" class="mb-4 info-card">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon
                    icon="mdi-map-marker"
                    class="me-2"
                    color="primary"
                  ></v-icon>
                </template>
                <v-list-item-title>{{
                  selectedOrder.attraction_name
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon
                    icon="mdi-ticket"
                    class="me-2"
                    color="primary"
                  ></v-icon>
                </template>
                <v-list-item-title>{{
                  selectedOrder.ticket_name
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon
                    icon="mdi-calendar"
                    class="me-2"
                    color="primary"
                  ></v-icon>
                </template>
                <v-list-item-title
                  >使用日期:
                  {{ formatDate(selectedOrder.date) }}</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>

          <div class="d-flex flex-wrap justify-space-between mb-2">
            <p class="text-subtitle-1 font-weight-bold">数量</p>
            <p class="text-subtitle-1">{{ selectedOrder.quantity }} 张</p>
          </div>
          <div class="d-flex flex-wrap justify-space-between">
            <p class="text-subtitle-1 font-weight-bold">总价</p>
            <p class="text-subtitle-1 text-primary font-weight-bold">
              ¥{{ selectedOrder.total_price.toFixed(2) }}
            </p>
          </div>
        </v-card-text>
      </v-card>

      <!-- 将按钮移到v-card外部 -->
      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          variant="text"
          @click="detailDialog = false"
          rounded="pill"
          class="mr-2"
        >
          关闭
        </v-btn>
        <v-btn
          v-if="
            !['cancelled', 'completed'].includes(selectedOrder?.status || '')
          "
          color="primary"
          variant="elevated"
          @click="openChangeStatusFromDetail"
          rounded="pill"
        >
          修改状态
        </v-btn>
      </div>
    </AppDialog>

    <!-- 修改状态对话框 -->
    <AppDialog
      v-model:show="statusDialog"
      title="修改订单状态"
      :loading="saving"
      persistent
      @confirm="updateOrderStatus"
      @cancel="statusDialog = false"
      confirmText="保存"
      :max-width="500"
    >
      <v-form ref="statusForm" @submit.prevent="updateOrderStatus">
        <p class="mb-4 status-dialog-text">
          您正在修改订单 <strong>#{{ orderToUpdate?.order_id }}</strong> 的状态
        </p>
        <v-select
          v-model="newStatus"
          :items="availableStatusOptions"
          item-title="text"
          item-value="value"
          label="新状态"
          required
          :rules="[(v: string) => !!v || '请选择新状态']"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-tag"
        ></v-select>
      </v-form>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { orderApi, attractionApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

// 订单类型定义
interface Order {
  order_id: number;
  user_id: number;
  ticket_id: number;
  quantity: number;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
  ticket_name: string;
  attraction_id: number;
  attraction_name: string;
  total_price: number;
}

// 景点类型定义
interface Attraction {
  id: number;
  name: string;
}

// 表格列定义
const headers = [
  { title: '订单号', key: 'order_id', sortable: true },
  { title: '用户ID', key: 'user_id', sortable: true },
  { title: '票种', key: 'ticket_info', sortable: false },
  { title: '数量', key: 'quantity', sortable: true },
  { title: '总价', key: 'total_price', sortable: true },
  { title: '使用日期', key: 'date', sortable: true },
  { title: '状态', key: 'status', sortable: true },
  { title: '创建时间', key: 'created_at', sortable: true },
  {
    title: '操作',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: '120px',
  },
];

// 状态变量
const orders = ref<Order[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalOrders = ref(0);
const searchKeyword = ref('');
const selectedAttraction = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);
const attractionOptions = ref<Attraction[]>([]);

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

// 状态选项
const statusOptions = [
  { text: '已完成', value: 'success' },
  { text: '已取消', value: 'cancelled' },
];

// 订单详情对话框
const detailDialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const loadingDetail = ref(false);

// 修改状态对话框
const statusDialog = ref(false);
const orderToUpdate = ref<Order | null>(null);
const newStatus = ref('');
const statusForm = ref(null);
const saving = ref(false);

// 可用状态选项（基于当前订单状态）
const availableStatusOptions = computed(() => {
  if (!orderToUpdate.value) return [];

  const currentStatus = orderToUpdate.value.status;
  // 基于当前状态，返回可以切换的状态选项
  switch (currentStatus) {
    case 'success':
      return statusOptions.filter((s) => ['cancelled'].includes(s.value));
    case 'cancelled':
      return []; // 已取消的订单不能再改变状态
    default:
      return statusOptions;
  }
});

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(async () => {
  await loadAttractions();
  loadOrders();
});

// 加载景点列表
async function loadAttractions() {
  try {
    const result = await attractionApi.query({});
    if (result.success && result.data?.data?.attractions) {
      attractionOptions.value = result.data.data.attractions.map(
        (attraction: any) => ({
          id: attraction.id,
          name: attraction.name,
        }),
      );
    } else {
      showError(result.error || '加载景点列表失败');
    }
  } catch (error) {
    showError(
      '加载景点列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

// 加载订单列表
async function loadOrders() {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    };

    // 添加搜索关键词（可能是订单号或用户ID）
    if (searchKeyword.value) {
      // 尝试解析为数字，可能是订单号或用户ID
      const numValue = parseInt(searchKeyword.value);
      if (!isNaN(numValue)) {
        if (searchKeyword.value.length >= 8) {
          // 假设订单号是较长的数字
          params.order_id = numValue;
        } else {
          // 假设用户ID是较短的数字
          params.user_id = numValue;
        }
      }
    }

    // 添加景点筛选
    if (selectedAttraction.value) {
      params.attraction_id = selectedAttraction.value;
    }

    // 添加状态筛选
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }

    // 添加日期范围筛选（确保使用YYYY-MM-DD格式）
    if (startDate.value) {
      // 确保是YYYY-MM-DD格式
      params.start_date = formatDateForApi(startDate.value);
    }
    if (endDate.value) {
      // 确保是YYYY-MM-DD格式
      params.end_date = formatDateForApi(endDate.value);
    }

    console.log('查询订单参数:', params);

    const result = await orderApi.query(params);

    if (result.success && result.data?.data) {
      console.log('订单查询结果:', result.data.data);
      orders.value = result.data.data.orders || [];

      // 确保数值类型正确
      orders.value = orders.value.map((order) => ({
        ...order,
        total_price:
          typeof order.total_price === 'number'
            ? order.total_price
            : parseFloat(order.total_price || '0'),
        quantity:
          typeof order.quantity === 'number'
            ? order.quantity
            : parseInt(order.quantity || '0'),
      }));

      totalOrders.value = result.data.data.total || orders.value.length;
    } else {
      showError(result.error || '加载订单列表失败');
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
    showError(
      '加载订单列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.text : status;
}

// 获取状态颜色
function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'grey';
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

// 查看订单详情
function viewOrderDetail(order: Order) {
  selectedOrder.value = {
    ...order,
    // 确保数值类型正确
    total_price:
      typeof order.total_price === 'number'
        ? order.total_price
        : parseFloat(order.total_price || '0'),
    quantity:
      typeof order.quantity === 'number'
        ? order.quantity
        : parseInt(order.quantity || '0'),
  };
  detailDialog.value = true;
}

// 打开修改状态对话框
function openChangeStatusDialog(order: Order) {
  orderToUpdate.value = order;
  newStatus.value = '';
  statusDialog.value = true;
}

// 从详情页打开修改状态对话框
function openChangeStatusFromDetail() {
  if (selectedOrder.value) {
    orderToUpdate.value = selectedOrder.value;
    newStatus.value = '';
    statusDialog.value = true;
    detailDialog.value = false;
  }
}

// 更新订单状态
async function updateOrderStatus() {
  // 表单验证
  const formEl = statusForm.value as any;
  if (formEl && !(await formEl.validate()).valid) {
    return;
  }

  if (!orderToUpdate.value || !newStatus.value) return;

  saving.value = true;
  try {
    const result = await orderApi.update({
      order_id: orderToUpdate.value.order_id,
      status: newStatus.value,
    });

    if (result.success) {
      showSuccess('订单状态更新成功');
      loadOrders();
      statusDialog.value = false;
    } else {
      showError(result.error || '更新订单状态失败');
    }
  } catch (error) {
    showError(
      '操作失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    saving.value = false;
  }
}

// 显示成功消息
function showSuccess(message: string) {
  snackbarText.value = message;
  snackbarColor.value = 'success';
  snackbar.value = true;
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

/* 状态对话框文本 */
.status-dialog-text {
  font-size: 0.95rem;
  color: var(--v-theme-on-surface);
}

/* 空状态样式 */
.empty-state {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--md-surface-1);
  border-radius: 16px;
  border: 1px solid var(--md-outline-variant);
}
</style>
