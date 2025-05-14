<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">在线购票</h1>

        <!-- 景点信息 -->
        <v-card
          v-if="selectedAttraction"
          class="mb-6"
          rounded="lg"
          elevation="1"
        >
          <v-card-title class="text-md-h6">景点信息</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-img
                  :src="selectedAttraction.image_url"
                  height="300"
                  cover
                  class="bg-grey-lighten-2 rounded-lg"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey-lighten-4"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-h5 mb-2">{{ selectedAttraction.name }}</div>
                <div class="text-body-1 text-medium-emphasis mb-4">
                  {{ selectedAttraction.description }}
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  <span>开放时间: {{ selectedAttraction.open_time }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-1">mdi-star</v-icon>
                  <span
                    >评分:
                    {{ selectedAttraction.feedback_avg || '暂无评分' }}</span
                  >
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 票种选择 -->
        <v-card
          v-if="selectedAttraction"
          class="mb-6"
          rounded="lg"
          elevation="1"
        >
          <v-card-title class="text-md-h6">选择票种</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedTicket"
                  :items="tickets"
                  item-title="name"
                  item-value="id"
                  label="选择票种"
                  variant="outlined"
                  :loading="loadingTickets"
                  return-object
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="ticketQuantity"
                  type="number"
                  label="购买数量"
                  variant="outlined"
                  min="1"
                  :max="selectedTicket?.available || 1"
                  :disabled="!selectedTicket"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 日期选择 -->
        <v-card v-if="selectedTicket" class="mb-6" rounded="lg" elevation="1">
          <v-card-title class="text-md-h6">选择日期</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="selectedDate"
                  :min="minDate"
                  :max="maxDate"
                  :disabled-dates="disabledDates"
                  color="primary"
                  elevation="0"
                  rounded="lg"
                ></v-date-picker>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text>
                    <div class="text-h6 mb-4">订单信息</div>
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-medium-emphasis">景点:</span>
                      <span>{{ selectedAttraction?.name }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-medium-emphasis">票种:</span>
                      <span>{{ selectedTicket?.name }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-medium-emphasis">数量:</span>
                      <span>{{ ticketQuantity }}张</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-medium-emphasis">日期:</span>
                      <span>{{ selectedDate }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-medium-emphasis">单价:</span>
                      <span>¥{{ selectedTicket?.price || 0 }}</span>
                    </div>
                    <v-divider class="my-4"></v-divider>
                    <div class="d-flex justify-space-between">
                      <span class="text-h6">总计:</span>
                      <span class="text-h6 text-primary">
                        ¥{{ (selectedTicket?.price || 0) * ticketQuantity }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 提交按钮 -->
        <v-card v-if="selectedTicket" rounded="lg" elevation="1">
          <v-card-text class="d-flex justify-end">
            <v-btn
              color="primary"
              size="large"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="submitOrder"
            >
              提交订单
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { attractionApi, ticketApi, orderApi } from '../utils/api';
import AppSnackbar from '../components/AppSnackbar.vue';
import dayjs from 'dayjs';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 状态变量
const selectedAttraction = ref<any>(null);
const tickets = ref<any[]>([]);
const selectedTicket = ref<any>(null);
const ticketQuantity = ref(1);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const loadingTickets = ref(false);
const submitting = ref(false);

// 消息提示
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

// 日期限制
const minDate = computed(() => dayjs().format('YYYY-MM-DD'));
const maxDate = computed(() => dayjs().add(30, 'day').format('YYYY-MM-DD'));
const disabledDates = ref<string[]>([]);

// 是否可以提交订单
const canSubmit = computed(() => {
  return (
    selectedAttraction.value &&
    selectedTicket.value &&
    ticketQuantity.value > 0 &&
    selectedDate.value &&
    !submitting.value
  );
});

// 加载景点详情
const loadAttractionDetail = async (attractionId: number) => {
  try {
    const result = await attractionApi.query({
      id: attractionId,
    });
    if (result.success && result.data?.data?.attractions) {
      selectedAttraction.value = result.data.data.attractions[0];
      await loadTickets(attractionId);
    } else {
      throw new Error(result.error || '获取景点详情失败');
    }
  } catch (error) {
    console.error('加载景点详情失败:', error);
    showSnackbar.value = true;
    snackbarText.value =
      error instanceof Error ? error.message : '加载景点详情失败';
    snackbarColor.value = 'error';
  }
};

// 加载票种列表
const loadTickets = async (attractionId: number) => {
  loadingTickets.value = true;
  try {
    const result = await ticketApi.query({ attraction_id: attractionId });
    if (result.success && result.data?.data?.tickets) {
      tickets.value = result.data.data.tickets;
    } else {
      throw new Error(result.error || '获取票种列表失败');
    }
  } catch (error) {
    console.error('加载票种列表失败:', error);
    showSnackbar.value = true;
    snackbarText.value =
      error instanceof Error ? error.message : '加载票种列表失败';
    snackbarColor.value = 'error';
  } finally {
    loadingTickets.value = false;
  }
};

// 检查日期余量
const checkDateAvailability = async () => {
  if (!selectedTicket.value || !selectedDate.value) return;

  try {
    const result = await ticketApi.check({
      ticket_id: Number(selectedTicket.value.id),
      date: selectedDate.value,
    });

    if (result.success && result.data?.data?.ticket) {
      const available = result.data.data.ticket.available;
      if (available < ticketQuantity.value) {
        showSnackbar.value = true;
        snackbarText.value = `当前日期余量不足，仅剩${available}张`;
        snackbarColor.value = 'warning';
        ticketQuantity.value = available;
      }
    }
  } catch (error) {
    console.error('检查余量失败:', error);
  }
};

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const result = await orderApi.create({
      ticket_id: selectedTicket.value.id,
      quantity: ticketQuantity.value,
      date: selectedDate.value,
    });

    if (result.success) {
      showSnackbar.value = true;
      snackbarText.value = '订单提交成功';
      snackbarColor.value = 'success';
      // 跳转到订单详情页
      router.push(`/orders/${result.data?.data?.ticket?.order_id}`);
    } else {
      throw new Error(result.error || '提交订单失败');
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    showSnackbar.value = true;
    snackbarText.value =
      error instanceof Error ? error.message : '提交订单失败';
    snackbarColor.value = 'error';
  } finally {
    submitting.value = false;
  }
};

// 监听日期变化
watch(selectedDate, (newDate) => {
  // 确保日期格式为 YYYY-MM-DD
  selectedDate.value = dayjs(newDate).format('YYYY-MM-DD');
  checkDateAvailability();
});

// 监听票种变化
watch(selectedTicket, () => {
  checkDateAvailability();
});

// 监听数量变化
watch(ticketQuantity, () => {
  checkDateAvailability();
});

// 页面加载
onMounted(async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  // 从URL参数获取景点ID
  const attractionId = Number(route.query.attraction_id);
  if (!attractionId) {
    showSnackbar.value = true;
    snackbarText.value = '无效的景点ID';
    snackbarColor.value = 'error';
    router.push('/attractions');
    return;
  }

  await loadAttractionDetail(attractionId);
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
</style>
