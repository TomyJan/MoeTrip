<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">订单详情</h1>

        <!-- 订单信息卡片 -->
        <v-card v-if="order" class="mb-6" rounded="lg" elevation="1">
          <v-card-title class="text-md-h6 d-flex align-center">
            <span>订单信息</span>
            <v-spacer></v-spacer>
            <v-chip
              :color="order.status === 'success' ? 'success' : 'error'"
              size="small"
              class="ml-2"
            >
              {{ order.status === 'success' ? '已确认' : '已取消' }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">基本信息</div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">订单编号:</span>
                  <span>{{ order.id }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">创建时间:</span>
                  <span>{{ formatDateTime(order.created_at) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">更新时间:</span>
                  <span>{{ formatDateTime(order.updated_at) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">订单状态:</span>
                  <span>{{
                    order.status === 'success' ? '已确认' : '已取消'
                  }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">门票信息</div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">景点名称:</span>
                  <span>{{ order.attraction_name }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">票种名称:</span>
                  <span>{{ order.ticket_name }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">门票数量:</span>
                  <span>{{ order.quantity }}张</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">游玩日期:</span>
                  <span>{{ formatDateOnly(order.date) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-medium-emphasis">总价:</span>
                  <span class="text-primary"
                    >¥{{ order.total_price || 0 }}</span
                  >
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn
              v-if="order.status === 'success'"
              color="error"
              variant="elevated"
              class="mr-2"
              :loading="cancelling"
              @click="showCancelDialog = true"
            >
              取消订单
            </v-btn>
            <v-btn
              v-if="order.status === 'success'"
              color="primary"
              variant="elevated"
              :loading="editing"
              @click="openEditDialog"
            >
              修改订单
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- 加载中状态 -->
        <v-card v-else-if="loading" class="mb-6" rounded="lg" elevation="1">
          <v-card-text class="d-flex justify-center align-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-card-text>
        </v-card>

        <!-- 错误状态 -->
        <v-card v-else class="mb-6" rounded="lg" elevation="1">
          <v-card-text class="text-center py-8">
            <div class="text-h6 text-error mb-2">加载失败</div>
            <div class="text-body-1 text-medium-emphasis mb-4">
              {{ errorMessage }}
            </div>
            <v-btn color="primary" @click="loadOrderDetail">重试</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 修改订单对话框 -->
    <v-dialog
      v-model="showEditDialog"
      max-width="600px"
      :persistent="false"
      :retain-focus="false"
      :scrim="true"
      @click:outside="closeEditDialog"
    >
      <v-card rounded="lg">
        <v-card-title class="text-md-h6">修改订单</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="updateOrder">
            <v-row>
              <!-- 票种选择 -->
              <v-col cols="12">
                <v-select
                  v-model="currentOrder.ticket_id"
                  :items="availableTickets"
                  item-title="name"
                  item-value="id"
                  label="选择票种"
                  variant="outlined"
                  :loading="loadingTickets"
                  return-object
                  @update:model-value="handleTicketChange"
                >
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <v-list-item-subtitle>
                        价格: ¥{{ item.raw.price }} | 余量:
                        {{ item.raw.available }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <span>{{
                      item?.raw?.name || getSelectedTicketName()
                    }}</span>
                  </template>
                </v-select>
              </v-col>

              <!-- 数量选择 -->
              <v-col cols="12">
                <v-text-field
                  v-model.number="currentOrder.quantity"
                  type="number"
                  label="门票数量"
                  variant="outlined"
                  min="1"
                  :max="maxQuantity"
                  :loading="checkingAvailability"
                  :error-messages="quantityError"
                  @input="checkAvailability"
                ></v-text-field>
              </v-col>

              <!-- 日期选择 -->
              <v-col cols="12">
                <v-date-picker
                  v-model="currentOrder.date"
                  :min="minDate"
                  :max="maxDate"
                  :disabled-dates="disabledDates"
                  color="primary"
                  elevation="0"
                  rounded="lg"
                  @update:model-value="checkAvailability"
                ></v-date-picker>
              </v-col>

              <!-- 订单价格预览 -->
              <v-col cols="12">
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">票种:</span>
                    <span>{{ getSelectedTicketName() }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">单价:</span>
                    <span>¥{{ getSelectedTicketPrice() }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">数量:</span>
                    <span>{{ currentOrder.quantity }}张</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">日期:</span>
                    <span>{{ formatDateOnly(currentOrder.date) }}</span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex justify-space-between mt-2">
                    <span class="text-subtitle-1 font-weight-bold">总价:</span>
                    <span class="text-subtitle-1 text-primary font-weight-bold">
                      ¥{{ calculateTotalPrice() }}
                    </span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            color="error"
            variant="text"
            :disabled="editing"
            @click="closeEditDialog"
            class="mr-2"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="editing"
            :disabled="!canUpdate"
            @click="updateOrder"
          >
            确认修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 取消订单确认对话框 -->
    <v-dialog
      v-model="showCancelDialog"
      max-width="400px"
      :persistent="false"
      :retain-focus="false"
      :scrim="true"
      @click:outside="closeCancelDialog"
    >
      <v-card rounded="lg">
        <v-card-title class="text-md-h6">确认取消订单</v-card-title>
        <v-card-text>
          <p class="text-body-1">确定要取消该订单吗？此操作不可撤销。</p>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="error"
            variant="elevated"
            :loading="cancelling"
            @click="cancelOrder"
          >
            确认取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="cancelling"
            @click="closeCancelDialog"
          >
            返回
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores';
import { orderApi, ticketApi } from '../utils/api';
import AppSnackbar from '../components/AppSnackbar.vue';
import dayjs from 'dayjs';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 状态变量
const order = ref<any>(null);
const loading = ref(true);
const errorMessage = ref('');
const editing = ref(false);
const cancelling = ref(false);
const checkingAvailability = ref(false);
const quantityError = ref('');
const loadingTickets = ref(false);
const availableTickets = ref<any[]>([]);

// 对话框状态
const showEditDialog = ref(false);
const showCancelDialog = ref(false);
const currentOrder = ref<any>(null);

// 消息提示
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

// 日期限制
const minDate = computed(() => dayjs().format('YYYY-MM-DD'));
const maxDate = computed(() => dayjs().add(30, 'day').format('YYYY-MM-DD'));
const disabledDates = ref<string[]>([]);

// 获取所选票种名称
const getSelectedTicketName = () => {
  if (!currentOrder.value || !currentOrder.value.ticket_id) return '';

  // 如果是使用的对象，直接获取名称
  if (
    typeof currentOrder.value.ticket_id === 'object' &&
    currentOrder.value.ticket_id.name
  ) {
    return currentOrder.value.ticket_id.name;
  }

  // 如果是ID，从票种列表中查找
  const ticket = availableTickets.value.find(
    (t) => t.id === currentOrder.value.ticket_id,
  );
  return ticket ? ticket.name : order.value?.ticket_name || '';
};

// 获取所选票种价格
const getSelectedTicketPrice = () => {
  if (!currentOrder.value || !currentOrder.value.ticket_id) return 0;

  // 如果是使用的对象，直接获取价格
  if (
    typeof currentOrder.value.ticket_id === 'object' &&
    currentOrder.value.ticket_id.price
  ) {
    return currentOrder.value.ticket_id.price;
  }

  // 如果是ID，从票种列表中查找
  const ticket = availableTickets.value.find(
    (t) => t.id === currentOrder.value.ticket_id,
  );
  return ticket ? ticket.price : 0;
};

// 计算总价
const calculateTotalPrice = () => {
  if (!currentOrder.value) return 0;
  const price = getSelectedTicketPrice();
  const quantity = currentOrder.value.quantity || 1;
  return (price * quantity).toFixed(2);
};

// 加载同一景点的其他票种
const loadAvailableTickets = async () => {
  if (!order.value || !order.value.attraction_id) return;

  loadingTickets.value = true;
  try {
    const result = await ticketApi.query({
      attraction_id: order.value.attraction_id,
    });

    if (result.success && result.data?.data?.tickets) {
      availableTickets.value = result.data.data.tickets;
    } else {
      throw new Error(result.error || '获取票种列表失败');
    }
  } catch (error) {
    console.error('加载票种列表失败:', error);
    showSnackbar.value = true;
    snackbarText.value = '获取可用票种失败，请重试';
    snackbarColor.value = 'error';
  } finally {
    loadingTickets.value = false;
  }
};

// 处理票种变更
const handleTicketChange = () => {
  checkAvailability();
};

// 打开编辑对话框
const openEditDialog = async () => {
  if (!order.value) return;

  try {
    // 1. 先加载票种列表
    await loadAvailableTickets();

    // 2. 查找当前票种对象
    let currentTicketObj = null;

    if (availableTickets.value.length > 0) {
      currentTicketObj = availableTickets.value.find(
        (t) => t.id === order.value.ticket_id,
      );
    }

    // 3. 如果没找到, 创建一个临时对象
    if (!currentTicketObj) {
      currentTicketObj = {
        id: order.value.ticket_id,
        name: order.value.ticket_name,
        price: order.value.total_price / order.value.quantity,
        available: order.value.available || 1,
        attraction_id: order.value.attraction_id,
      };
    }

    // 4. 设置当前订单数据
    currentOrder.value = {
      ...order.value,
      quantity: order.value.quantity,
      date: order.value.date,
      ticket_id: currentTicketObj, // 直接设置为对象
    };

    console.log('设置当前票种:', currentTicketObj);

    // 5. 打开对话框
    showEditDialog.value = true;

    // 6. 检查余量
    checkAvailability();
  } catch (error) {
    console.error('打开编辑对话框失败:', error);
    showSnackbar.value = true;
    snackbarText.value = '加载票种信息失败，请重试';
    snackbarColor.value = 'error';
  }
};

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false;
};

// 是否可以更新订单
const canUpdate = computed(() => {
  if (!order.value || !currentOrder.value) return false;
  return (
    order.value.status === 'success' &&
    (currentOrder.value.quantity !== order.value.quantity ||
      currentOrder.value.date !== order.value.date ||
      currentOrder.value.ticket_id !== order.value.ticket_id) &&
    !quantityError.value &&
    !editing.value
  );
});

// 最大可购买数量
const maxQuantity = computed(() => {
  return order.value?.available || 1;
});

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 格式化日期
const formatDateOnly = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD');
};

// 加载订单详情
const loadOrderDetail = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const orderId = Number(route.params.id);
    if (!orderId) {
      throw new Error('无效的订单ID');
    }

    const result = await orderApi.query({ order_id: orderId });
    if (result.success && result.data?.data?.orders?.[0]) {
      order.value = result.data.data.orders[0];
      // 初始化编辑表单
      currentOrder.value = {
        ...order.value,
        quantity: order.value.quantity,
        date: order.value.date,
      };
    } else {
      throw new Error(result.error || '获取订单详情失败');
    }
  } catch (error) {
    console.error('加载订单详情失败:', error);
    errorMessage.value =
      error instanceof Error ? error.message : '加载订单详情失败';
  } finally {
    loading.value = false;
  }
};

// 检查余量
const checkAvailability = async () => {
  if (!currentOrder.value || !currentOrder.value.ticket_id) return;

  checkingAvailability.value = true;
  quantityError.value = '';

  try {
    // 获取当前选择的票种ID
    const ticketId =
      typeof currentOrder.value.ticket_id === 'object'
        ? currentOrder.value.ticket_id.id
        : currentOrder.value.ticket_id;

    const result = await ticketApi.check({
      ticket_id: ticketId,
      date: dayjs(currentOrder.value.date).format('YYYY-MM-DD'),
    });

    if (result.success && result.data?.data?.ticket) {
      const available = result.data.data.ticket.available;

      // 更新当前选择的票种的可用数量（如果是对象形式）
      if (typeof currentOrder.value.ticket_id === 'object') {
        currentOrder.value.ticket_id.available = available;
      }

      if (available < currentOrder.value.quantity) {
        quantityError.value = `当前日期余量不足，仅剩${available}张`;
        currentOrder.value.quantity = available > 0 ? available : 1;
      }
    }
  } catch (error) {
    console.error('检查余量失败:', error);
    quantityError.value = '检查余量失败，请稍后重试';
  } finally {
    checkingAvailability.value = false;
  }
};

// 更新订单
const updateOrder = async () => {
  if (!canUpdate.value || !currentOrder.value) return;

  editing.value = true;
  try {
    // 获取当前选择的票种ID
    const ticketId =
      typeof currentOrder.value.ticket_id === 'object'
        ? currentOrder.value.ticket_id.id
        : currentOrder.value.ticket_id;

    const result = await orderApi.update({
      order_id: currentOrder.value.id,
      quantity: currentOrder.value.quantity,
      date: dayjs(currentOrder.value.date).format('YYYY-MM-DD'),
      ticket_id: ticketId,
    });

    if (result.success) {
      showSnackbar.value = true;
      snackbarText.value = '订单更新成功';
      snackbarColor.value = 'success';
      showEditDialog.value = false;
      await loadOrderDetail(); // 重新加载订单详情
    } else {
      throw new Error(result.error || '更新订单失败');
    }
  } catch (error) {
    console.error('更新订单失败:', error);
    showSnackbar.value = true;
    snackbarText.value =
      error instanceof Error ? error.message : '更新订单失败';
    snackbarColor.value = 'error';
  } finally {
    editing.value = false;
  }
};

// 取消订单
const cancelOrder = async () => {
  if (!order.value) return;

  cancelling.value = true;
  try {
    const result = await orderApi.update({
      order_id: order.value.id,
      status: 'cancelled',
    });

    if (result.success) {
      showSnackbar.value = true;
      snackbarText.value = '订单已取消';
      snackbarColor.value = 'success';
      showCancelDialog.value = false;
      await loadOrderDetail(); // 重新加载订单详情
    } else {
      throw new Error(result.error || '取消订单失败');
    }
  } catch (error) {
    console.error('取消订单失败:', error);
    showSnackbar.value = true;
    snackbarText.value =
      error instanceof Error ? error.message : '取消订单失败';
    snackbarColor.value = 'error';
  } finally {
    cancelling.value = false;
  }
};

// 监听票种ID变化
watch(
  () => currentOrder.value?.ticket_id,
  (newVal) => {
    if (newVal) {
      console.log('票种ID变化:', typeof newVal, newVal);
      if (typeof newVal === 'object') {
        console.log('票种名称:', newVal.name);
      } else {
        // 如果是ID，尝试找到对应的票种对象
        const ticket = availableTickets.value.find((t) => t.id === newVal);
        if (ticket) {
          console.log('找到票种对象:', ticket.name);
          // 使用setTimeout避免循环更新
          setTimeout(() => {
            currentOrder.value.ticket_id = ticket;
          }, 0);
        }
      }
    }
  },
  { immediate: true, deep: true },
);

// 关闭取消订单对话框
const closeCancelDialog = () => {
  showCancelDialog.value = false;
};

// 监听编辑对话框关闭，清空数据
watch(showEditDialog, (newVal) => {
  if (!newVal) {
    // 对话框关闭后，等待动画完成再清空数据
    setTimeout(() => {
      currentOrder.value = null;
    }, 300);
  }
});

// 页面加载和卸载
onMounted(async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  await loadOrderDetail();
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  // 无需清理事件监听器，因为我们使用了Vuetify内置的点击外部关闭功能
});
</script>

<style scoped>
.v-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid var(--card-border);
  background: var(--md-surface);
}

.v-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

/* 对话框过渡动画 */
:deep(.v-dialog-transition-enter-active),
:deep(.v-dialog-transition-leave-active) {
  transition: all 0.3s ease;
}

:deep(.v-dialog-transition-enter-from),
:deep(.v-dialog-transition-leave-to) {
  opacity: 0;
  transform: scale(0.95);
}
</style>
