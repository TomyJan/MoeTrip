<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">景点信息</h1>
        
        <!-- 搜索栏 -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchKeyword"
              label="搜索景点"
              prepend-inner-icon="mdi-magnify"
              hide-details
              density="compact"
              variant="outlined"
              @keyup.enter="loadAttractions"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-btn 
              color="primary"
              block
              @click="loadAttractions"
            >
              搜索
            </v-btn>
          </v-col>
          <v-col v-if="userStore.isAdmin" cols="12" sm="6" md="3">
            <v-btn 
              color="success"
              prepend-icon="mdi-plus"
              block
              @click="showAddDialog = true"
            >
              添加景点
            </v-btn>
          </v-col>
        </v-row>
        
        <!-- 景点列表 -->
        <v-row v-if="attractions.length > 0">
          <v-col v-for="attraction in attractions" :key="attraction.id" cols="12" md="6" lg="4">
            <AttractionCard 
              :attraction="attraction"
              @view="viewAttractionDetail(attraction)"
            />
          </v-col>
        </v-row>
        
        <!-- 暂无数据 -->
        <v-row v-else>
          <v-col cols="12" class="text-center py-8">
            <v-icon icon="mdi-alert-circle-outline" size="large" color="grey"></v-icon>
            <p class="mt-2 text-body-1">暂无景点数据</p>
          </v-col>
        </v-row>
        
        <!-- 分页控件 -->
        <v-row v-if="totalItems > 0">
          <v-col cols="12" class="d-flex justify-center">
            <v-pagination
              v-model="page"
              :length="Math.ceil(totalItems / pageSize)"
              @update:model-value="loadAttractions"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    
    <!-- 添加景点对话框 -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>添加新景点</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addAttraction">
            <v-text-field
              v-model="newAttraction.name"
              label="景点名称"
              required
            ></v-text-field>
            
            <v-textarea
              v-model="newAttraction.description"
              label="景点描述"
              required
            ></v-textarea>
            
            <v-text-field
              v-model="newAttraction.open_time"
              label="开放时间"
              placeholder="09:00-18:00"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="newAttraction.image_url"
              label="图片URL"
              placeholder="/images/example.jpg"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="showAddDialog = false">取消</v-btn>
          <v-btn color="primary" @click="addAttraction" :loading="loading">添加</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 消息提示条 -->
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../stores'
import { attractionApi } from '../utils/api'
import { useRouter } from 'vue-router'
import AttractionCard from '../components/AttractionCard.vue'

// 定义类型
interface Attraction {
  id: number
  name: string
  description: string
  open_time: string
  image_url: string
  created_at?: string
  updated_at?: string
}

const router = useRouter()
const userStore = useUserStore()

// 分页和搜索
const page = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const searchKeyword = ref('')

// 景点数据
const attractions = ref<Attraction[]>([])

// 对话框状态
const showAddDialog = ref(false)
const loading = ref(false)

// 新景点表单
const newAttraction = reactive({
  name: '',
  description: '',
  open_time: '',
  image_url: ''
})

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
      keyword: searchKeyword.value
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
      totalItems.value = response.data.total || response.data.attractions.length;
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
    snackbarText.value = error instanceof Error ? error.message : '加载景点数据出错';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
}

// 添加景点
const addAttraction = async () => {
  if (!newAttraction.name || !newAttraction.description || !newAttraction.open_time) {
    snackbarText.value = '请填写所有必填字段';
    snackbarColor.value = 'warning';
    showSnackbar.value = true;
    return;
  }
  
  loading.value = true;
  
  try {
    const result = await attractionApi.add({
      name: newAttraction.name,
      description: newAttraction.description,
      open_time: newAttraction.open_time,
      image_url: newAttraction.image_url || '/placeholder-image.jpg'
    });
    
    // 检查是否请求成功
    if (!result.success) {
      snackbarText.value = result.error || '添加景点失败';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
      return;
    }
    
    // 重置表单
    newAttraction.name = '';
    newAttraction.description = '';
    newAttraction.open_time = '';
    newAttraction.image_url = '';
    
    // 关闭对话框并刷新数据
    showAddDialog.value = false;
    
    // 显示成功消息
    snackbarText.value = '景点添加成功';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    
    loadAttractions();
  } catch (error) {
    console.error('添加景点失败:', error);
    snackbarText.value = error instanceof Error ? error.message : '添加景点失败';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
}

// 查看景点详情
function viewAttractionDetail(attraction: Attraction) {
  router.push(`/attractions/${attraction.id}`)
}

// 页面加载时获取景点列表
onMounted(() => {
  loadAttractions()
})
</script>
