<template>
  <div class="attractions-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="md-headline-medium mb-6 font-weight-medium">景点信息</h1>

          <!-- 搜索栏 -->
          <v-card
            class="search-card mb-6"
            rounded="lg"
            variant="outlined"
            color="surface-variant"
            flat
          >
            <v-card-text>
              <v-row class="align-center">
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="searchKeyword"
                    label="搜索景点"
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                    bg-color="surface"
                    rounded="lg"
                    class="search-field"
                    @keyup.enter="loadAttractions"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    block
                    rounded="pill"
                    class="search-btn"
                    :loading="loading"
                    :disabled="loading"
                    @click="loadAttractions"
                  >
                    <v-icon
                      icon="mdi-magnify"
                      size="small"
                      class="mr-2"
                    ></v-icon>
                    搜索
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 景点列表 -->
          <v-fade-transition>
            <v-row v-if="attractions.length > 0">
              <v-col
                v-for="attraction in attractions"
                :key="attraction.id"
                cols="12"
                md="6"
                lg="4"
              >
                <AttractionCard
                  :attraction="attraction"
                  @view="viewAttractionDetail(attraction)"
                />
              </v-col>
            </v-row>

            <!-- 暂无数据 -->
            <v-row v-else>
              <v-col cols="12">
                <div class="empty-state">
                  <v-icon
                    icon="mdi-alert-circle"
                    size="large"
                    color="outline"
                    class="mb-3"
                  ></v-icon>
                  <p class="md-body-large text-medium-emphasis">
                    {{ loading ? '正在加载景点数据...' : '暂无景点数据' }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-fade-transition>

          <!-- 分页控件 -->
          <div class="d-flex justify-center mt-4" v-if="totalItems > 0">
            <v-pagination
              v-model="page"
              :length="Math.ceil(totalItems / pageSize)"
              @update:model-value="loadAttractions"
              rounded="lg"
              active-color="primary"
              variant="text"
              class="md3-pagination"
            ></v-pagination>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- 消息提示条 -->
    <AppSnackbar
      v-model:show="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { attractionApi } from '../utils/api';
import { useRouter } from 'vue-router';
import AttractionCard from '../components/AttractionCard.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

// 定义类型
interface Attraction {
  id: number;
  name: string;
  description: string;
  open_time: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

const router = useRouter();

// 分页和搜索
const page = ref(1);
const pageSize = ref(9);
const totalItems = ref(0);
const searchKeyword = ref('');

// 景点数据
const attractions = ref<Attraction[]>([]);

// 状态变量
const loading = ref(false);

// 消息通知状态
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 获取景点列表
const loadAttractions = async () => {
  loading.value = true;

  try {
    const result = await attractionApi.query({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    });

    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '加载景点数据失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      attractions.value = [];
      totalItems.value = 0;
      return;
    }

    const response = result.data;
    if (response.data && response.data.attractions) {
      attractions.value = response.data.attractions;
      totalItems.value =
        response.data.total || response.data.attractions.length;
      // 如果返回的景点数量为0，并且当前页不是第一页，则回到第一页
      if (response.data.attractions.length === 0 && page.value > 1) {
        page.value = 1;
        await loadAttractions();
      }
    } else if (Array.isArray(response.data)) {
      attractions.value = response.data;
      totalItems.value = response.total || response.data.length;
    } else {
      attractions.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error('加载景点数据失败', error);
    attractions.value = [];
    totalItems.value = 0;
    snackbarText.value =
      error instanceof Error ? error.message : '加载景点数据出错';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
};

// 查看景点详情
function viewAttractionDetail(attraction: Attraction) {
  router.push(`/attractions/${attraction.id}`);
}

// 页面加载时获取景点列表
onMounted(() => {
  loadAttractions();
});
</script>

<style scoped>
.attractions-page {
  min-height: 100vh;
  background-color: var(--md-surface);
}

.search-card {
  border: 1px solid var(--md-outline-variant);
  background-color: var(--md-surface-1) !important;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field :deep(.v-field) {
  border-radius: 12px;
  background-color: var(--md-surface);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field :deep(.v-field__outline) {
  opacity: 0.8;
  color: var(--md-outline);
}

.search-field :deep(.v-field--focused) {
  background-color: var(--md-surface);
}

.search-field :deep(.v-field--focused .v-field__outline) {
  opacity: 1;
  color: var(--md-primary);
}

.search-btn {
  height: 48px;
  font-weight: 500;
  letter-spacing: 0.0178571em;
  text-transform: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-2);
}

.empty-state {
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--md-surface-1);
  border-radius: 16px;
  border: 1px solid var(--md-outline-variant);
  margin: 24px 0;
}
</style>
