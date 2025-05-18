<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores';
import { attractionApi, feedbackApi, facilityApi } from '../utils/api';
import { formatShortDate } from '../utils/format';
import AppSnackbar from '../components/AppSnackbar.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
import AppDialog from '../components/AppDialog.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 状态
const attraction = ref<any>(null);
const feedbacks = ref<any[]>([]);
const facilities = ref<any[]>([]);
const selectedFacility = ref<any>(null);
const loading = ref(true);
const loadingFacilities = ref(false);
const loadingError = ref('');
const showAddFeedbackDialog = ref(false);

// 新增反馈表单
const newFeedback = ref({
  score: 5,
  comment: '',
});

// 消息通知状态
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 获取景点详情
async function loadAttractionDetail() {
  loading.value = true;
  loadingError.value = '';

  const attractionId = parseInt(route.params.id as string);

  if (isNaN(attractionId)) {
    loadingError.value = '无效的景点ID';
    loading.value = false;
    return;
  }

  try {
    // 加载景点详情
    const attractionResult = await attractionApi.query({
      id: Number(attractionId),
    });

    // 检查是否请求成功
    if (!attractionResult.success) {
      loadingError.value = attractionResult.error || '获取景点详情失败';
      loading.value = false;
      return;
    }

    const attractionResponse = attractionResult.data;
    if (attractionResponse.data && attractionResponse.data.attractions) {
      attraction.value = attractionResponse.data.attractions[0];
    } else if (attractionResponse.data) {
      attraction.value = attractionResponse.data;
    }

    if (!attraction.value) {
      loadingError.value = '未找到该景点';
      return;
    }

    // 加载设施信息
    loadFacilities(attractionId);

    // 加载景点反馈
    if (userStore.isLoggedIn) {
      const feedbackResult = await feedbackApi.query({
        attraction_id: attractionId,
        page: 1,
        pageSize: 10,
      });

      // 检查是否请求成功
      if (!feedbackResult.success) {
        // 只在控制台显示错误，不影响景点展示
        console.error('获取反馈失败:', feedbackResult.error);
        return;
      }

      const feedbackResponse = feedbackResult.data;
      if (feedbackResponse.data && feedbackResponse.data.feedback) {
        feedbacks.value = feedbackResponse.data.feedback;
      } else if (feedbackResponse.data) {
        feedbacks.value = feedbackResponse.data;
      }
    } else {
      feedbacks.value = [];
    }
  } catch (error) {
    console.error('加载景点详情失败', error);
    loadingError.value = '加载景点详情失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

// 加载设施信息
async function loadFacilities(attractionId: number) {
  loadingFacilities.value = true;
  try {
    const result = await facilityApi.query({
      attraction_id: attractionId,
    });

    if (result.success && result.data?.data?.facilities) {
      facilities.value = result.data.data.facilities;
    }
  } catch (error) {
    console.error('加载设施信息失败:', error);
  } finally {
    loadingFacilities.value = false;
  }
}

// 添加反馈
async function submitFeedback() {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  try {
    const result = await feedbackApi.add({
      attraction_id: parseInt(route.params.id as string),
      score: newFeedback.value.score,
      comment: newFeedback.value.comment,
    });

    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '提交反馈失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }

    // 重新加载反馈
    loadAttractionDetail();

    // 重置表单并关闭对话框
    newFeedback.value = { score: 5, comment: '' };
    showAddFeedbackDialog.value = false;

    // 显示成功消息
    snackbarText.value = '反馈提交成功';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
  } catch (error) {
    console.error('提交反馈失败', error);
    snackbarText.value =
      error instanceof Error ? error.message : '提交反馈失败，请稍后重试';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
}

onMounted(() => {
  loadAttractionDetail();
});
</script>

<template>
  <v-container>
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-skeleton">
      <v-card class="mb-4" rounded="lg">
        <v-card-title>
          <v-skeleton-loader type="text"></v-skeleton-loader>
        </v-card-title>
      </v-card>

      <v-card class="mb-4" rounded="lg">
        <v-card-text>
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-card-text>
      </v-card>

      <v-card rounded="lg">
        <v-card-text>
          <v-skeleton-loader type="paragraph"></v-skeleton-loader>
        </v-card-text>
      </v-card>
    </div>

    <!-- 加载错误 -->
    <v-alert
      v-else-if="loadingError"
      type="error"
      variant="tonal"
      class="mt-4"
      rounded="lg"
      border
    >
      {{ loadingError }}
      <div class="mt-2">
        <v-btn
          color="primary"
          rounded="pill"
          variant="tonal"
          @click="router.push('/attractions')"
        >
          返回景点列表
        </v-btn>
      </div>
    </v-alert>

    <!-- 景点详情 -->
    <template v-else-if="attraction">
      <v-breadcrumbs
        :items="[
          { title: '首页', disabled: false, to: '/' },
          { title: '景点', disabled: false, to: '/attractions' },
          { title: attraction.name, disabled: true },
        ]"
        rounded="pill"
      ></v-breadcrumbs>

      <v-row>
        <!-- 景点图片 -->
        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="lg">
            <v-img
              :src="attraction.image_url"
              height="400"
              cover
              class="bg-grey-lighten-2 rounded-t-lg"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
              </template>
            </v-img>
          </v-card>
        </v-col>

        <!-- 景点信息 -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title class="text-md-h4">{{
              attraction.name
            }}</v-card-title>

            <v-card-text>
              <v-row align="center" class="mx-0 mb-2">
                <v-rating
                  :model-value="parseFloat(attraction.feedback_avg)"
                  color="amber-darken-2"
                  density="comfortable"
                  half-increments
                  readonly
                  size="small"
                ></v-rating>
                <span class="ms-2 text-subtitle-1"
                  >{{ attraction.feedback_avg }}分</span
                >
                <span class="text-caption text-medium-emphasis ms-2"
                  >({{ attraction.feedback_total }}条评价)</span
                >
              </v-row>

              <v-divider class="mb-3"></v-divider>

              <div class="mb-3 d-flex align-center">
                <v-icon
                  icon="mdi-clock-outline"
                  size="small"
                  color="primary"
                  class="me-2"
                ></v-icon>
                <strong>开放时间：</strong>
                {{ attraction.open_time || '暂无信息' }}
              </div>

              <div class="mb-3 d-flex align-center">
                <v-icon
                  icon="mdi-calendar-outline"
                  size="small"
                  color="primary"
                  class="me-2"
                ></v-icon>
                <strong>创建时间：</strong>
                {{ formatShortDate(attraction.created_at) }}
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="text-subtitle-1 mb-2 font-weight-medium">
                景点描述
              </div>
              <p class="text-md-body-1">
                {{ attraction.description || '暂无描述' }}
              </p>

              <v-divider class="my-3"></v-divider>

              <div class="text-subtitle-1 mb-2 font-weight-medium">
                设施信息
              </div>
              <div v-if="loadingFacilities" class="text-center pa-2">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
              </div>
              <div v-else-if="facilities.length > 0">
                <v-chip-group>
                  <v-chip
                    v-for="facility in facilities"
                    :key="facility.id"
                    :color="
                      facility.status === 'normal' ? 'success' : 'warning'
                    "
                    variant="elevated"
                    size="small"
                    class="mr-2 mb-2"
                    rounded="pill"
                    @click="
                      selectedFacility =
                        facility === selectedFacility ? null : facility
                    "
                    :class="{
                      'v-chip--selected': selectedFacility?.id === facility.id,
                    }"
                  >
                    {{ facility.name }}
                    <v-icon
                      v-if="facility.status === 'maintenance'"
                      class="ml-1"
                      size="x-small"
                    >
                      mdi-tools
                    </v-icon>
                  </v-chip>
                </v-chip-group>

                <div v-if="selectedFacility" class="mt-3 facility-location">
                  <v-alert
                    density="compact"
                    type="info"
                    variant="tonal"
                    rounded="lg"
                    class="text-body-2 pa-3"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-map-marker-outline"
                          color="info"
                          class="mr-2"
                          size="small"
                        ></v-icon>
                        <strong>{{ selectedFacility.name }}</strong>
                        <v-chip
                          size="x-small"
                          :color="
                            selectedFacility.status === 'normal'
                              ? 'success'
                              : 'warning'
                          "
                          class="ml-2"
                          rounded="pill"
                          variant="flat"
                        >
                          {{
                            selectedFacility.status === 'normal'
                              ? '正常'
                              : '维护中'
                          }}
                        </v-chip>
                      </div>
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        @click="selectedFacility = null"
                      >
                        <v-icon size="small">mdi-close</v-icon>
                      </v-btn>
                    </div>
                    <p class="mt-1 mb-0">
                      位置: {{ selectedFacility.location }}
                    </p>
                  </v-alert>
                </div>
              </div>
              <p v-else class="text-medium-emphasis">暂无设施信息</p>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="elevated"
                rounded="pill"
                prepend-icon="mdi-ticket"
                class="text-none mr-2"
                @click="
                  router.push(`/ticket/buy?attraction_id=${attraction.id}`)
                "
              >
                立即购票
              </v-btn>
              <v-btn
                color="primary"
                variant="tonal"
                rounded="pill"
                prepend-icon="mdi-message-draw"
                class="text-none"
                @click="
                  userStore.isLoggedIn
                    ? (showAddFeedbackDialog = true)
                    : router.push('/login')
                "
              >
                写评价
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 反馈列表 -->
      <v-row class="mt-6">
        <v-col cols="12">
          <h2 class="text-md-h5 mb-4 font-weight-medium">用户评价</h2>

          <v-card
            v-if="!userStore.isLoggedIn"
            elevation="0"
            rounded="lg"
            class="text-center py-12 bg-surface-variant"
          >
            <v-icon
              icon="mdi-lock-outline"
              size="large"
              color="on-surface-variant"
            ></v-icon>
            <p class="text-md-body-1 mt-2 text-medium-emphasis">登录后可见</p>
            <v-btn
              color="primary"
              variant="tonal"
              rounded="pill"
              class="mt-4"
              to="/login"
            >
              去登录
            </v-btn>
          </v-card>

          <v-card
            v-else-if="feedbacks.length === 0"
            elevation="0"
            rounded="lg"
            class="text-center py-12 bg-surface-variant"
          >
            <v-icon
              icon="mdi-comment-outline"
              size="large"
              color="on-surface-variant"
            ></v-icon>
            <p class="text-md-body-1 mt-2 text-medium-emphasis">暂无评价</p>
          </v-card>

          <div v-else>
            <v-card
              v-for="feedback in feedbacks"
              :key="feedback.id"
              class="mb-4"
              rounded="lg"
              elevation="1"
            >
              <v-card-title class="d-flex align-center">
                <span class="text-subtitle-1"
                  >用户 #{{ feedback.user_id }}</span
                >
                <v-spacer></v-spacer>
                <v-chip
                  color="amber-darken-2"
                  size="small"
                  class="ml-2"
                  rounded="pill"
                  variant="flat"
                >
                  {{ feedback.score }}
                  <v-icon size="x-small" icon="mdi-star" class="ml-1"></v-icon>
                </v-chip>
              </v-card-title>

              <v-card-subtitle>
                <span class="text-caption text-medium-emphasis">{{
                  formatShortDate(feedback.created_at)
                }}</span>
              </v-card-subtitle>

              <v-card-text class="pt-2">
                <p v-if="feedback.comment" class="text-md-body-1">
                  {{ feedback.comment }}
                </p>
                <p v-else class="text-medium-emphasis">该用户未留下评论</p>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </template>

    <!-- 添加反馈对话框 -->
    <AppDialog
      v-model:show="showAddFeedbackDialog"
      title="评价景点"
      :subtitle="attraction ? attraction.name : ''"
      confirmText="提交评价"
      :loading="loading"
      :hideActions="true"
      @confirm="submitFeedback"
    >
      <FeedbackForm
        :initialScore="newFeedback.score"
        :initialComment="newFeedback.comment"
        :loading="loading"
        @submit="
          (data) => {
            newFeedback.score = data.score;
            newFeedback.comment = data.comment;
            submitFeedback();
          }
        "
        @cancel="showAddFeedbackDialog = false"
      />
    </AppDialog>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<style scoped>
.v-card {
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.v-card:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.08);
}

.loading-skeleton {
  padding: 16px;
}

:deep(.v-chip) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.v-chip--selected) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.facility-location {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
