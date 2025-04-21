<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">反馈管理</h1>

        <!-- 过滤和搜索 -->
        <SearchFilterBar
          v-model:searchTerm="filters.keyword"
          searchLabel="关键字搜索"
          @search="loadFeedback"
        >
          <template #filters>
            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.attraction_id"
                label="景点筛选"
                :items="attractionOptions || []"
                item-title="name"
                item-value="id"
                density="comfortable"
                variant="outlined"
                clearable
                return-object
                hide-details
                @update:model-value="loadFeedback"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.min_score"
                label="最低评分"
                :items="[1, 2, 3, 4, 5]"
                density="comfortable"
                variant="outlined"
                clearable
                hide-details
                prepend-inner-icon="mdi-star-outline"
                @update:model-value="loadFeedback"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-select
                v-model="filters.max_score"
                label="最高评分"
                :items="[1, 2, 3, 4, 5]"
                density="comfortable"
                variant="outlined"
                clearable
                hide-details
                prepend-inner-icon="mdi-star"
                @update:model-value="loadFeedback"
              ></v-select>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 统计信息卡片 (管理员专用) -->
        <v-row v-if="userStore.isAdmin" class="mb-4">
          <v-col cols="12">
            <v-card>
              <v-card-title>反馈统计</v-card-title>
              <v-card-text v-if="stats">
                <v-row>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center">
                      <h3 class="text-h3 text-primary">
                        {{ stats.totalCount }}
                      </h3>
                      <p class="text-body-2">总反馈数</p>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center">
                      <h3 class="text-h3 text-amber-darken-2">
                        {{ stats.avgScore }}
                      </h3>
                      <p class="text-body-2">平均评分</p>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center">
                      <h3 class="text-h3 text-green-darken-1">
                        {{ stats.withCommentCount }}
                      </h3>
                      <p class="text-body-2">有评论数量</p>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center">
                      <h3 class="text-h3 text-blue-darken-1">
                        {{ stats.withCommentPercent }}%
                      </h3>
                      <p class="text-body-2">评论占比</p>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <v-row>
                  <v-col cols="12">
                    <h3 class="text-subtitle-1 mb-2">评分分布</h3>
                    <v-chart
                      :option="scoreDistributionOption"
                      style="height: 200px"
                      autoresize
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 反馈列表 -->
        <v-row v-if="feedbackList && feedbackList.length > 0">
          <v-col cols="12">
            <v-card
              v-for="feedback in feedbackList"
              :key="feedback.id"
              class="mb-4"
            >
              <v-card-title class="d-flex align-center">
                <span>{{
                  userStore.isAdmin ? `用户ID: ${feedback.user_id}` : '我的反馈'
                }}</span>
                <v-spacer></v-spacer>
                <v-chip color="amber" size="small" class="ml-2">
                  {{ feedback.score }}
                  <v-icon size="x-small" icon="mdi-star" class="ml-1"></v-icon>
                </v-chip>
              </v-card-title>

              <v-card-subtitle>
                景点: {{ feedback.attraction_name }}
                <span class="text-caption ml-2 text-grey">{{
                  formatDateTime(feedback.updated_at)
                }}</span>
              </v-card-subtitle>

              <v-card-text>
                <p v-if="feedback.comment">{{ feedback.comment }}</p>
                <p v-else class="text-grey">该用户未留下评论</p>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="canEditFeedback(feedback)"
                  variant="text"
                  color="primary"
                  @click="editFeedback(feedback)"
                >
                  编辑
                </v-btn>
                <v-btn
                  v-if="canEditFeedback(feedback)"
                  variant="text"
                  color="error"
                  @click="deleteFeedback(feedback)"
                >
                  删除
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- 分页控件 -->
        <AppPagination
          v-model:page="page"
          :pageSize="pageSize"
          :totalItems="totalItems || 0"
          emptyText="暂无反馈数据"
          emptyIcon="mdi-emoticon-sad-outline"
        />
      </v-col>
    </v-row>

    <!-- 编辑反馈对话框 -->
    <AppDialog
      v-model:show="showEditDialog"
      title="编辑反馈"
      :subtitle="
        editingFeedback
          ? `景点: ${editingFeedback.attraction_name} 用户ID: ${editingFeedback.user_id} 时间: ${formatDateTime(editingFeedback.updated_at)}`
          : ''
      "
      confirmText="更新"
      :loading="loading"
      :hideActions="true"
      @confirm="updateFeedback"
    >
      <FeedbackForm
        v-if="editingFeedback"
        :initialScore="editingFeedback.score"
        :initialComment="editingFeedback.comment"
        :loading="loading"
        @submit="
          (data) => {
            editingFeedback.score = data.score;
            editingFeedback.comment = data.comment;
            updateFeedback();
          }
        "
        @cancel="showEditDialog = false"
      />
    </AppDialog>

    <!-- 删除确认对话框 -->
    <AppDialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      confirmText="删除"
      cancelText="取消"
      :loading="loading"
      @confirm="confirmDelete"
    >
      <p>您确定要删除这条反馈吗？此操作不可逆。</p>
    </AppDialog>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useUserStore } from '../stores';
import { attractionApi, feedbackApi } from '../utils/api';
import { formatDateTime } from '../utils/format';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppPagination from '../components/AppPagination.vue';
import AppDialog from '../components/AppDialog.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

const userStore = useUserStore();

// 景点选项
const attractionOptions = ref<{ id: number; name: string }[]>([]);

// 分页状态
const page = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 过滤条件
const filters = reactive({
  attraction_id: null as number | null,
  min_score: null as number | null,
  max_score: null as number | null,
  keyword: '',
  user_id: null, // 管理员可以看所有用户的反馈
});

// 反馈数据
const feedbackList = ref<any[]>([]);
const stats = ref<any>(null);

// 对话框状态
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const editingFeedback = ref<any>(null);
const deletingFeedback = ref<any>(null);

// 消息提示
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const loading = ref(false);

// 添加主题配置辅助函数
const getChartThemeConfig = () => {
  // 检测是否为深色模式
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
  
  return {
    // 文本颜色配置
    textStyle: {
      color: `var(--chart-text-color)`
    },
    // 标题颜色配置
    title: {
      textStyle: {
        color: `var(--chart-title-color)`
      }
    },
    // 图例颜色配置
    legend: {
      textStyle: {
        color: `var(--chart-text-color)`
      }
    },
    // 坐标轴配置
    xAxis: {
      axisLine: {
        lineStyle: {
          color: `var(--chart-axis-color)`
        }
      },
      axisLabel: {
        color: `var(--chart-axis-color)`
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: `var(--chart-axis-color)`
        }
      },
      axisLabel: {
        color: `var(--chart-axis-color)`
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    // 提示框配置
    tooltip: {
      backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDarkMode ? 'rgba(70, 70, 70, 0.9)' : 'rgba(200, 200, 200, 0.9)',
      textStyle: {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
      }
    }
  };
};

// 评分分布图表配置
const scoreDistributionOption = computed(() => {
  const themeConfig = getChartThemeConfig();
  
  if (!stats.value || !stats.value.scoreDistribution) {
    return {
      ...themeConfig,
      title: {
        ...themeConfig.title,
        text: '评分分布',
        left: 'center',
      },
      tooltip: {
        ...themeConfig.tooltip,
        trigger: 'item',
      },
      grid: {
        show: false
      },
      xAxis: {
        show: false,
        type: 'category'
      },
      yAxis: {
        show: false,
        type: 'value'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: document.body.getAttribute('data-theme') === 'dark' ? '#2C2B30' : '#fff',
            borderWidth: 2,
          },
          label: {
            color: 'var(--chart-label-color)'
          },
          data: [
            { value: 0, name: '1星' },
            { value: 0, name: '2星' },
            { value: 0, name: '3星' },
            { value: 0, name: '4星' },
            { value: 0, name: '5星' },
          ],
        },
      ],
    };
  }

  const distribution = stats.value.scoreDistribution;
  return {
    ...themeConfig,
    title: {
      ...themeConfig.title,
      text: '评分分布',
      left: 'center',
    },
    tooltip: {
      ...themeConfig.tooltip,
      trigger: 'item',
    },
    grid: {
      show: false
    },
    xAxis: {
      show: false,
      type: 'category'
    },
    yAxis: {
      show: false,
      type: 'value'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: document.body.getAttribute('data-theme') === 'dark' ? '#2C2B30' : '#fff',
          borderWidth: 2,
        },
        label: {
          color: 'var(--chart-label-color)'
        },
        emphasis: {
          label: {
            color: 'var(--chart-label-color)',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: distribution['1'] || 0, name: '1星' },
          { value: distribution['2'] || 0, name: '2星' },
          { value: distribution['3'] || 0, name: '3星' },
          { value: distribution['4'] || 0, name: '4星' },
          { value: distribution['5'] || 0, name: '5星' },
        ],
      },
    ],
  };
});

// 加载反馈数据
const loadFeedback = async () => {
  loading.value = true;

  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    };

    if (filters.attraction_id !== null) {
      params.attraction_id =
        typeof filters.attraction_id === 'object'
          ? (filters.attraction_id as any).id
          : filters.attraction_id;
    }

    if (filters.min_score !== null) {
      params.min_score = filters.min_score;
    }

    if (filters.max_score !== null) {
      params.max_score = filters.max_score;
    }

    if (filters.keyword) {
      params.keyword = filters.keyword;
    }

    if (filters.user_id !== null) {
      params.user_id = filters.user_id;
    }

    const response = await feedbackApi.query(params);

    if (response.success) {
      feedbackList.value = response.data.data.feedback;
      totalItems.value = response.data.data.total;
    } else {
      showError(response.error || '获取反馈失败');
    }

    // 管理员用户加载统计数据
    if (userStore.isAdmin) {
      loadStatistics();
    }
  } catch (error) {
    console.error('加载反馈出错:', error);
    showError('获取反馈失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await feedbackApi.stats({});

    if (response.success) {
      stats.value = response.data.data;
      console.log('统计数据:', stats.value);
    } else {
      console.error('获取统计数据失败:', response.error);
    }
  } catch (error) {
    console.error('加载统计数据出错:', error);
  }
};

// 加载景点选项
const loadAttractions = async () => {
  try {
    const response = await attractionApi.query({});

    if (response.success) {
      attractionOptions.value = response.data.data.attractions;
    }
  } catch (error) {
    console.error('加载景点出错:', error);
  }
};

// 检查是否可以编辑反馈
const canEditFeedback = (feedback: any): boolean => {
  return userStore.isAdmin || feedback.user_id === userStore.id;
};

// 编辑反馈
const editFeedback = (feedback: any) => {
  editingFeedback.value = { ...feedback };
  showEditDialog.value = true;
};

// 更新反馈
const updateFeedback = async () => {
  if (!editingFeedback.value) return;

  loading.value = true;

  try {
    const response = await feedbackApi.update(editingFeedback.value);

    if (response.success) {
      showSuccess('反馈更新成功');
      showEditDialog.value = false;
      loadFeedback();
    } else {
      showError(response.error || '更新反馈失败');
    }
  } catch (error) {
    console.error('更新反馈出错:', error);
    showError('更新反馈失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 删除反馈
const deleteFeedback = (feedback: any) => {
  deletingFeedback.value = feedback;
  showDeleteDialog.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!deletingFeedback.value) return;

  loading.value = true;

  try {
    const response = await feedbackApi.update({
      id: deletingFeedback.value.id,
      status: 'deleted',
    });

    if (response.success) {
      showSuccess('反馈删除成功');
      showDeleteDialog.value = false;
      loadFeedback();
    } else {
      showError(response.error || '删除反馈失败');
    }
  } catch (error) {
    console.error('删除反馈出错:', error);
    showError('删除反馈失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 显示成功消息
const showSuccess = (text: string) => {
  snackbarColor.value = 'success';
  snackbarText.value = text;
  showSnackbar.value = true;
};

// 显示错误消息
const showError = (text: string) => {
  snackbarColor.value = 'error';
  snackbarText.value = text;
  showSnackbar.value = true;
};

// 首次加载数据
onMounted(() => {
  loadAttractions();
  loadFeedback();
});
</script>

<style scoped>
/* 调整按钮和输入框高度一致 */
:deep(.v-btn) {
  height: 48px;
}
</style>
