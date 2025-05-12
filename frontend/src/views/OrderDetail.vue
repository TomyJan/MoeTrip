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
                  <span>{{ order.status === 'success' ? '已确认' : '已取消' }}</span>
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
                  <span class="text-primary">¥{{ order.total_price || 0 }}</span>
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
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>

        <!-- 错误状态 -->
        <v-card v-else class="mb-6" rounded="lg" elevation="1">
          <v-card-text class="text-center py-8">
            <div class="text-h6 text-error mb-2">加载失败</div>
            <div class="text-body-1 text-medium-emphasis mb-4">{{ errorMessage }}</div>
            <v-btn color="primary" @click="loadOrderDetail">重试</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 修改订单对话框 -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <v-card rounded="lg">
        <v-card-title class="text-md-h6">修改订单</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="updateOrder">
            <v-row>
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
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="primary"
            variant="elevated"
            :loading="editing"
            :disabled="!canUpdate"
            @click="updateOrder"
          >
            确认修改
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="editing"
            @click="closeEditDialog"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 取消订单确认对话框 -->
    <v-dialog v-model="showCancelDialog" max-width="400px">
      <v-card rounded="lg">
        <v-card-title class="text-md-h6">确认取消订单</v-card-title>
        <v-card-text>
          <p class="text-body-1">
            确定要取消该订单吗？此操作不可撤销。
          </p>
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
            @click="showCancelDialog = false"
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
import { ref, computed, onMounted, watch } from 'vue';
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

// 打开编辑对话框
const openEditDialog = () => {
  if (order.value) {
    currentOrder.value = {
      ...order.value,
      quantity: order.value.quantity,
      date: order.value.date,
    };
    showEditDialog.value = true;
  }
};

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false;
  currentOrder.value = null;
};

// 是否可以更新订单
const canUpdate = computed(() => {
  if (!order.value || !currentOrder.value) return false;
  return (
    order.value.status === 'success' &&
    (currentOrder.value.quantity !== order.value.quantity ||
      currentOrder.value.date !== order.value.date) &&
    !quantityError.value
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
    errorMessage.value = error instanceof Error ? error.message : '加载订单详情失败';
  } finally {
    loading.value = false;
  }
};

// 检查余量
const checkAvailability = async () => {
  if (!order.value) return;

  checkingAvailability.value = true;
  quantityError.value = '';

  try {
    const result = await ticketApi.check({
      ticket_id: order.value.ticket_id,
      date: dayjs(currentOrder.value.date).format('YYYY-MM-DD'),
    });

    if (result.success && result.data?.data?.ticket) {
      const available = result.data.data.ticket.available;
      if (available < currentOrder.value.quantity) {
        quantityError.value = `当前日期余量不足，仅剩${available}张`;
        currentOrder.value.quantity = available;
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
    const result = await orderApi.update({
      order_id: currentOrder.value.id,
      quantity: currentOrder.value.quantity,
      date: dayjs(currentOrder.value.date).format('YYYY-MM-DD'),
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
    snackbarText.value = error instanceof Error ? error.message : '更新订单失败';
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
    snackbarText.value = error instanceof Error ? error.message : '取消订单失败';
    snackbarColor.value = 'error';
  } finally {
    cancelling.value = false;
  }
};

// 页面加载
onMounted(async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  await loadOrderDetail();
});
</script>

<style scoped>
.v-card {
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  border: 1px solid var(--card-border);
  background: var(--md-surface);
}

.v-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}
</style>
