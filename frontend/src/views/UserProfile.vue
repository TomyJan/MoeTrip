<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores'
import { feedbackApi, orderApi } from '../utils/api'
import { formatDateTime } from '../utils/format'
import { useRouter } from 'vue-router'

// 定义类型
interface Feedback {
  id: number
  user_id: number
  attraction_id: number
  attraction_name: string
  score: number
  comment?: string
  created_at?: string
  updated_at?: string
}

interface Order {
  id: number
  user_id: number
  attraction_id: number
  attraction_name?: string
  ticket_id: number
  ticket_name?: string
  quantity: number
  date?: string
  total_price: number
  status: string
  created_at?: string
}

interface ApiDebug {
  request: any
  response: any
  error: any
}

const userStore = useUserStore()
const router = useRouter()
const loading = ref(true)
const loadingFeedbacks = ref(true)
const loadingOrders = ref(true)
const loadingError = ref('')
const apiDebug = ref<ApiDebug>({ request: null, response: null, error: null })

// 用户反馈列表
const userFeedbacks = ref<Feedback[]>([])
const page = ref(1)
const pageSize = ref(5)
const totalItems = ref(0)

// 用户订单列表
const userOrders = ref<Order[]>([])
const orderPage = ref(1)
const orderPageSize = ref(5)
const totalOrders = ref(0)

// 编辑反馈相关
const showEditDialog = ref(false)
const editingFeedback = ref<Feedback | null>(null)

// 添加调试信息
console.log('UserProfile 组件初始化')
console.log('用户登录状态:', userStore.isLoggedIn)
console.log('用户ID:', userStore.id)
console.log('用户名:', userStore.username)

// 监听用户登录状态变化
watch(() => userStore.isLoggedIn, (newVal) => {
  console.log('用户登录状态变化:', newVal)
  if (newVal) {
    loadUserFeedbacks()
    loadUserOrders()
  }
})

// 加载用户的反馈
async function loadUserFeedbacks() {
  if (!userStore.isLoggedIn || !userStore.id) {
    loadingError.value = '请先登录'
    loading.value = false
    loadingFeedbacks.value = false
    return
  }
  
  loadingFeedbacks.value = true
  apiDebug.value = { request: null, response: null, error: null };
  
  try {
    const userId = userStore.id;
    console.log('尝试加载用户ID为', userId, '的反馈');
    
    // 防止API请求参数错误
    if (!userId || typeof userId !== 'number') {
      throw new Error('无效的用户ID');
    }
    
    const params = {
      user_id: userId,
      page: page.value,
      pageSize: pageSize.value
    };
    
    console.log('API请求参数:', params);
    apiDebug.value.request = params;
    
    // 调用反馈API
    const result = await feedbackApi.query(params);
    apiDebug.value.response = result;
    console.log('API请求响应:', result);
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '获取反馈失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      userFeedbacks.value = [];
      totalItems.value = 0;
      return;
    }
    
    // 处理成功响应
    const response = result.data;
    if (response.data) {
      if (response.data.feedback) {
        userFeedbacks.value = response.data.feedback;
        totalItems.value = response.data.total || response.data.feedback.length;
      } else if (Array.isArray(response.data)) {
        userFeedbacks.value = response.data;
        totalItems.value = response.data.length;
      } else {
        console.log('未找到有效的反馈数据结构');
        userFeedbacks.value = [];
        totalItems.value = 0;
      }
    } else {
      userFeedbacks.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error('加载用户反馈失败', error);
    apiDebug.value.error = error;
    userFeedbacks.value = []; 
    totalItems.value = 0;
    
    // 详细记录错误
    if (error instanceof Error) {
      loadingError.value = `加载反馈失败: ${error.message}`;
      snackbarText.value = error.message;
    } else {
      loadingError.value = '加载用户反馈失败，请稍后重试';
      snackbarText.value = '加载用户反馈失败';
    }
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loadingFeedbacks.value = false;
    loading.value = false;
  }
}

// 加载用户的订单
async function loadUserOrders() {
  if (!userStore.isLoggedIn || !userStore.id) {
    loadingOrders.value = false
    return
  }
  
  loadingOrders.value = true
  
  try {
    const userId = userStore.id as number;
    
    // 使用订单API查询
    const result = await orderApi.query({
      user_id: userId
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '获取订单失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      userOrders.value = [];
      totalOrders.value = 0;
      return;
    }
    
    // 处理成功响应
    const response = result.data;
    console.log('订单数据:', response.data);
    
    if (response.data) {
      if (response.data.orders) {
        userOrders.value = response.data.orders;
        totalOrders.value = response.data.total || response.data.orders.length;
      } else if (Array.isArray(response.data)) {
        userOrders.value = response.data;
        totalOrders.value = response.data.length;
      } else {
        console.log('未找到有效的订单数据结构');
        userOrders.value = [];
        totalOrders.value = 0;
      }
    } else {
      userOrders.value = [];
      totalOrders.value = 0;
    }
  } catch (error) {
    console.error('加载用户订单失败', error);
    userOrders.value = [];
    totalOrders.value = 0;
    
    snackbarText.value = error instanceof Error ? error.message : '加载用户订单失败';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loadingOrders.value = false;
  }
}

// 编辑反馈
function editFeedback(feedback: Feedback) {
  editingFeedback.value = { ...feedback };
  showEditDialog.value = true;
}

// 更新反馈
async function updateFeedback() {
  if (!editingFeedback.value) return;
  
  try {
    // 调用API更新反馈
    const result = await feedbackApi.update({
      id: editingFeedback.value.id,
      score: editingFeedback.value.score,
      comment: editingFeedback.value.comment
    });
    
    console.log('更新反馈结果:', result);
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '更新反馈失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 更新本地数据
    const index = userFeedbacks.value.findIndex(f => f.id === editingFeedback.value?.id);
    if (index >= 0 && editingFeedback.value) {
      userFeedbacks.value[index] = { ...editingFeedback.value };
    }
    
    showEditDialog.value = false;
    editingFeedback.value = null;
  } catch (error) {
    console.error('更新反馈失败', error);
    snackbarText.value = error instanceof Error ? error.message : '更新反馈失败';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
}

// 删除反馈
async function deleteFeedback(feedback: Feedback) {
  if (!confirm('确定要删除此反馈吗？')) return;
  
  try {
    // 调用删除API，通过update来更改状态实现删除
    const result = await feedbackApi.update({
      id: feedback.id,
      status: 'deleted'
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '删除反馈失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 更新本地数据
    userFeedbacks.value = userFeedbacks.value.filter(f => f.id !== feedback.id);
    totalItems.value--;
  } catch (error) {
    console.error('删除反馈失败', error);
    snackbarText.value = error instanceof Error ? error.message : '删除反馈失败';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
}

// 添加对话框和消息通知相关状态
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 添加当前编辑订单
const currentOrder = ref<any>(null);

// 编辑订单
const showEditOrderDialog = ref(false);

// 支付订单
async function payOrder(orderId: number) {
  try {
    // 显示确认对话框
    const confirm = window.confirm('确定要支付此订单吗？');
    if (!confirm) return;
    
    loading.value = true;
    
    // 调用更新订单API
    const result = await orderApi.update({
      order_id: orderId,
      status: 'success',
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '订单支付失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 支付成功
    snackbarText.value = '订单支付成功';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    await loadUserOrders(); // 重新加载订单
  } catch (error) {
    console.error('支付订单出错', error);
    snackbarText.value = error instanceof Error ? error.message : '支付过程中出现错误';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
}

// 取消订单
async function cancelOrder(orderId: number) {
  try {
    // 显示确认对话框
    const confirm = window.confirm('确定要取消此订单吗？');
    if (!confirm) return;
    
    loading.value = true;
    
    // 调用更新订单API
    const result = await orderApi.update({
      order_id: orderId,
      status: 'canceled',
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '取消订单失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 取消成功
    snackbarText.value = '订单已取消';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    await loadUserOrders(); // 重新加载订单
  } catch (error) {
    console.error('取消订单出错', error);
    snackbarText.value = error instanceof Error ? error.message : '取消过程中出现错误';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
}

// 格式化订单状态
function formatOrderStatus(status: string): { text: string, color: string } {
  switch (status) {
    case '已完成':
      return { text: '已完成', color: 'success' }
    case '待支付':
      return { text: '待支付', color: 'warning' }
    case '已取消':
      return { text: '已取消', color: 'error' }
    default:
      return { text: status, color: 'primary' }
  }
}

// 格式化日期为YYYY-MM-DD格式
function formatDateOnly(dateString: string | undefined | null): string {
  if (!dateString) return '';
  
  // 确保我们处理的是字符串
  const dateStr = String(dateString);
  
  // 如果已经是YYYY-MM-DD格式，直接返回
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  try {
    // 否则进行转换
    const date = new Date(dateStr);
    // 检查是否为有效日期
    if (isNaN(date.getTime())) {
      return '';
    }
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
}

// 修改密码相关
const showChangePasswordDialog = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordErrors = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改密码
function changePassword() {
  // 重置错误
  passwordErrors.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  
  // 简单验证
  let hasError = false
  
  if (!passwordForm.value.oldPassword) {
    passwordErrors.value.oldPassword = '请输入当前密码'
    hasError = true
  }
  
  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = '请输入新密码'
    hasError = true
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = '密码长度至少为6位'
    hasError = true
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = '两次输入的密码不一致'
    hasError = true
  }
  
  if (hasError) {
    return
  }
  
  // TODO: 实现密码修改API调用
  alert('密码修改功能待实现')
  
  // 重置表单并关闭对话框
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showChangePasswordDialog.value = false
}

// 重新加载数据
function reloadData() {
  console.log('手动重新加载数据')
  userStore.restoreFromStorage()
  loading.value = true
  loadingError.value = ''
  
  if (userStore.isLoggedIn) {
    loadUserFeedbacks()
  } else {
    loading.value = false
    loadingError.value = '无法恢复用户会话，请重新登录'
  }
}

// 加载页面数据
function loadPageData() {
  console.log('加载页面数据')
  loading.value = true
  loadingError.value = ''
  userStore.restoreFromStorage()
  
  if (userStore.isLoggedIn) {
    loadUserFeedbacks()
    loadUserOrders()
  } else {
    loading.value = false
    loadingError.value = '请先登录'
  }
}

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  console.log('路由变化:', newPath)
  if (newPath === '/profile') {
    loadPageData()
  }
})

// 编辑订单函数
function editOrder(order: any) {
  currentOrder.value = order;
  showEditOrderDialog.value = true;
}

// 确认修改订单
async function confirmEditOrder() {
  if (!currentOrder.value) return;
  
  loading.value = true;
  showEditOrderDialog.value = false;
  
  try {
    // 格式化日期为YYYY-MM-DD格式
    const formattedDate = formatDateOnly(currentOrder.value.date);
    
    // 使用真实API调用更新订单
    const result = await orderApi.update({
      order_id: currentOrder.value.id,
      quantity: currentOrder.value.quantity,
      date: formattedDate
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '修改订单失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 修改成功
    snackbarText.value = '订单修改成功';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    await loadUserOrders(); // 重新加载订单
  } catch (error) {
    console.error('修改订单出错', error);
    snackbarText.value = error instanceof Error ? error.message : '修改订单失败';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPageData()
})
</script>

<template>
  <v-container>
    <h1 class="text-md-h4 mb-6 font-weight-medium">个人中心</h1>
    
    <!-- 主内容区 -->
    <div v-if="userStore.isLoggedIn">
      <!-- 加载中状态 -->
      <div v-if="loading && !loadingError" class="py-4">
        <v-skeleton-loader
          type="card"
        ></v-skeleton-loader>
        
        <v-skeleton-loader
          type="list-item"
          class="mt-4"
        ></v-skeleton-loader>
        
        <v-skeleton-loader
          type="list-item"
          class="mt-4"
        ></v-skeleton-loader>
      </div>
      
      <!-- 加载完成 -->
      <v-row v-else>
        <v-col cols="12" md="4">
          <v-card rounded="lg" elevation="1">
            <v-card-title class="text-md-h6">基本资料</v-card-title>
            <v-divider></v-divider>
            
            <v-card-text class="pt-4">
              <div class="d-flex justify-center">
                <v-avatar size="120" color="primary" class="mb-4">
                  <v-icon icon="mdi-account" size="64" color="white"></v-icon>
                </v-avatar>
              </div>
              
              <h2 class="text-md-h5 mb-2 text-center">{{ userStore.username }}</h2>
              <p class="text-caption text-medium-emphasis text-center">用户ID: {{ userStore.id }}</p>
              
              <v-divider class="my-4"></v-divider>
              
              <p><strong>用户类型:</strong> {{ userStore.isAdmin ? '管理员' : '普通用户' }}</p>
              
              <v-divider class="my-4"></v-divider>
              
              <v-btn 
                block 
                color="primary"
                variant="tonal"
                rounded="pill"
                class="mt-4 text-none"
                @click="showChangePasswordDialog = true"
              >
                修改密码
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="8">
          <!-- 订单信息 -->
          <v-card class="mb-6" rounded="lg" elevation="1">
            <v-card-title class="text-md-h6 d-flex align-center">
              我的订单
              <v-spacer></v-spacer>
              <v-chip rounded="pill" size="small">{{ totalOrders }} 条记录</v-chip>
            </v-card-title>
            <v-divider></v-divider>
            
            <!-- 加载订单中 -->
            <div v-if="loadingOrders" class="py-4">
              <v-skeleton-loader type="list-item"></v-skeleton-loader>
              <v-skeleton-loader type="list-item" class="mt-2"></v-skeleton-loader>
            </div>
            
            <!-- 订单列表 -->
            <template v-else>
              <v-card-text v-if="userOrders.length === 0" class="text-center py-8">
                <v-icon icon="mdi-ticket-outline" size="large" color="secondary"></v-icon>
                <p class="text-md-body-1 mt-2 text-medium-emphasis">您还没有任何订单</p>
              </v-card-text>
              
              <div v-else>
                <v-list>
                  <v-list-item
                    v-for="order in userOrders"
                    :key="order.id"
                    class="mb-3"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary" class="mr-3">
                        <v-icon icon="mdi-ticket" color="white"></v-icon>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="d-flex align-center">
                      <span>{{ order.attraction_name || `景点 #${order.attraction_id}` }}</span>
                      <v-spacer></v-spacer>
                      <v-chip
                        :color="formatOrderStatus(order.status).color"
                        size="small"
                        variant="flat"
                        rounded="pill"
                      >
                        {{ formatOrderStatus(order.status).text }}
                      </v-chip>
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                      <div class="mt-2 d-flex align-center">
                        <span>{{ order.ticket_name || '门票' }} × {{ order.quantity }} | {{ formatDateOnly(order.date) }}</span>
                        <v-spacer></v-spacer>
                        <span class="text-primary">{{ order.total_price ? `¥ ${order.total_price}` : '免费' }}</span>
                      </div>
                      <div class="mt-1 text-caption text-medium-emphasis">
                        订单号: {{ order.id }} | {{ formatDateTime(order.created_at) }}
                      </div>
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <v-btn
                        v-if="order.status === '待支付'"
                        variant="text"
                        color="primary"
                        size="small"
                        rounded="pill"
                        class="text-none"
                        @click="payOrder(order.id)"
                      >
                        支付
                      </v-btn>
                      <v-btn
                        v-if="order.status === '待支付'"
                        variant="text"
                        color="error"
                        size="small"
                        @click="cancelOrder(order.id)"
                      >
                        取消
                      </v-btn>
                      <v-btn
                        v-if="order.status !== '已取消' && order.status !== 'canceled'"
                        variant="text"
                        color="info"
                        size="small"
                        @click="editOrder(order)"
                      >
                        修改
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                
                <v-divider class="my-2"></v-divider>
                
                <div class="py-2">
                  <v-pagination
                    v-if="totalOrders > orderPageSize"
                    v-model="orderPage"
                    :length="Math.ceil(totalOrders / orderPageSize)"
                    @update:model-value="loadUserOrders"
                    density="compact"
                    class="my-2"
                  ></v-pagination>
                </div>
              </div>
            </template>
          </v-card>
          
          <!-- 反馈信息 -->
          <v-card rounded="lg" elevation="1">
            <v-card-title class="text-md-h6 d-flex align-center">
              我的评价
              <v-spacer></v-spacer>
              <v-chip rounded="pill" size="small">{{ totalItems }} 条记录</v-chip>
            </v-card-title>
            <v-divider></v-divider>
            
            <!-- 加载用户反馈中 -->
            <div v-if="loadingFeedbacks" class="py-4">
              <v-skeleton-loader type="list-item"></v-skeleton-loader>
              <v-skeleton-loader type="list-item" class="mt-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item" class="mt-2"></v-skeleton-loader>
            </div>
            
            <!-- 加载失败 -->
            <v-card-text v-else-if="loadingError" class="py-4">
              <v-alert
                type="warning"
                variant="tonal"
              >
                {{ loadingError }}
              </v-alert>
              <div class="d-flex justify-center mt-4">
                <v-btn color="primary" @click="reloadData">重新加载</v-btn>
              </div>
            </v-card-text>
            
            <!-- 反馈列表 -->
            <template v-else>
              <v-card-text v-if="userFeedbacks.length === 0" class="text-center py-8">
                <v-icon icon="mdi-comment-outline" size="large" color="secondary"></v-icon>
                <p class="text-md-body-1 mt-2 text-medium-emphasis">您还没有提交过任何反馈</p>
              </v-card-text>
              
              <div v-else>
                <v-list>
                  <v-list-item
                    v-for="feedback in userFeedbacks"
                    :key="feedback.id"
                    class="mb-3"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="amber" class="mr-3">
                        <span class="text-h6 text-white">{{ feedback.score }}</span>
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="d-flex align-center">
                      <span>{{ feedback.attraction_name || `景点 #${feedback.attraction_id}` }} {{ formatDateTime(feedback.updated_at) }}</span>
                      <v-spacer></v-spacer>
                      <div>
                        <v-btn
                          variant="text"
                          color="primary"
                          size="small"
                          icon="mdi-pencil"
                          class="mr-1"
                          @click="editFeedback(feedback)"
                        ></v-btn>
                        <v-btn
                          variant="text"
                          color="error"
                          size="small"
                          icon="mdi-delete"
                          @click="deleteFeedback(feedback)"
                        ></v-btn>
                      </div>
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                      <div class="mt-2">
                        <span v-if="feedback.comment" class="text-body-2">{{ feedback.comment }}</span>
                        <span v-else class="text-caption text-medium-emphasis">无评论内容</span>
                      </div>
                      <div class="mt-1 text-caption text-medium-emphasis">
                        {{ formatDateTime(feedback.created_at) }}
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                
                <v-divider class="my-2"></v-divider>
                
                <div class="py-2">
                  <v-pagination
                    v-if="totalItems > pageSize"
                    v-model="page"
                    :length="Math.ceil(totalItems / pageSize)"
                    @update:model-value="loadUserFeedbacks"
                    density="compact"
                    class="my-2"
                  ></v-pagination>
                </div>
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- 登录提示 -->
    <v-alert
      v-else
      type="warning"
      variant="tonal"
      class="mt-4"
      rounded="lg"
      border
    >
      请先登录以查看个人信息
      <div class="mt-3">
        <v-btn 
          color="primary" 
          variant="tonal"
          rounded="pill"
          class="text-none"
          to="/login"
        >
          立即登录
        </v-btn>
      </div>
    </v-alert>
    
    <!-- 修改密码对话框 -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500">
      <v-card>
        <v-card-title>修改密码</v-card-title>
        
        <v-card-text>
          <v-form @submit.prevent="changePassword">
            <v-text-field
              v-model="passwordForm.oldPassword"
              label="当前密码"
              type="password"
              :error-messages="passwordErrors.oldPassword"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="passwordForm.newPassword"
              label="新密码"
              type="password"
              :error-messages="passwordErrors.newPassword"
              hint="密码长度至少为6位"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="确认新密码"
              type="password"
              :error-messages="passwordErrors.confirmPassword"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showChangePasswordDialog = false">取消</v-btn>
          <v-btn color="primary" @click="changePassword">确认修改</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 编辑反馈对话框 -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card rounded="lg" elevation="3">
        <v-card-title class="text-md-h6">编辑评价</v-card-title>
        <v-card-text class="pt-3">
          <v-form @submit.prevent="updateFeedback">
            <p class="text-md-subtitle-1 mb-2">景点: {{ editingFeedback?.attraction_name || '未知景点' }}</p>
            
            <v-rating
              v-if="editingFeedback"
              v-model="editingFeedback.score"
              color="amber-darken-2"
              hover
              half-increments
              size="large"
              class="mb-3"
            ></v-rating>
            
            <v-textarea
              v-if="editingFeedback"
              v-model="editingFeedback.comment"
              label="评价内容"
              variant="outlined"
              density="comfortable"
              bg-color="surface-variant"
              rounded="lg"
              class="mb-3"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="secondary" 
            variant="text" 
            rounded="pill"
            class="mr-2"
            @click="showEditDialog = false"
          >
            取消
          </v-btn>
          <v-btn 
            color="primary" 
            variant="tonal"
            rounded="pill"
            @click="updateFeedback"
          >
            保存修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 调试面板 -->
    <v-expansion-panels v-if="loadingError" class="mt-6">
      <v-expansion-panel>
        <v-expansion-panel-title>
          API请求调试信息
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <h3 class="text-subtitle-1 font-weight-bold">请求参数:</h3>
          <pre>{{ apiDebug.request ? JSON.stringify(apiDebug.request, null, 2) : '无请求数据' }}</pre>
          
          <h3 class="text-subtitle-1 font-weight-bold mt-4">响应数据:</h3>
          <pre>{{ apiDebug.response ? JSON.stringify(apiDebug.response, null, 2) : '无响应数据' }}</pre>
          
          <h3 class="text-subtitle-1 font-weight-bold mt-4">错误信息:</h3>
          <pre>{{ apiDebug.error ? (typeof apiDebug.error === 'object' ? JSON.stringify(apiDebug.error, null, 2) : apiDebug.error) : '无错误信息' }}</pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <!-- 消息提示 -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
    
    <!-- 编辑订单对话框 -->
    <v-dialog v-model="showEditOrderDialog" max-width="600">
      <v-card rounded="lg" elevation="3">
        <v-card-title class="text-md-h6">修改订单</v-card-title>
        <v-card-text class="pt-3">
          <v-form v-if="currentOrder" @submit.prevent="confirmEditOrder">
            <p class="text-md-subtitle-1 mb-2">景点: {{ currentOrder.attraction_name || '未知景点' }}</p>
            <p class="text-md-subtitle-2 mb-3">票种: {{ currentOrder.ticket_name || '普通票' }}</p>
            
            <v-text-field
              v-model.number="currentOrder.quantity"
              label="数量"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
              bg-color="surface-variant"
              rounded="lg"
              class="mb-3"
            ></v-text-field>
            
            <v-text-field
              v-model="currentOrder.date"
              label="预约日期"
              type="date"
              variant="outlined"
              density="comfortable"
              bg-color="surface-variant"
              rounded="lg"
              class="mb-3"
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="secondary" 
            variant="text" 
            rounded="pill"
            class="mr-2"
            @click="showEditOrderDialog = false"
          >
            取消
          </v-btn>
          <v-btn 
            color="primary"
            variant="tonal"
            rounded="pill"
            @click="confirmEditOrder"
          >
            保存修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-divider></v-divider>
  </v-container>
</template>

<style scoped>
.v-card {
  overflow: hidden;
  transition: box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08),
              0 2px 4px rgba(0, 0, 0, 0.08);
}

.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: var(--md-surface-variant);
}
</style>
