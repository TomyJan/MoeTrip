<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">景点管理</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="搜索景点"
          @search="loadAttractions"
        >
          <template #filters>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="2" class="text-right">
              <v-btn
                color="primary"
                prepend-icon="mdi-map-marker-plus"
                @click="openAddDialog"
                rounded="pill"
              >
                添加景点
              </v-btn>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 景点列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="attractions"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
          >
            <template v-slot:item.image_url="{ item }">
              <v-img
                :src="item.image_url || '/images/new.jpg'"
                width="80"
                height="45"
                cover
                class="rounded-lg"
              ></v-img>
            </template>
            <template v-slot:item.description="{ item }">
              <div class="text-truncate" style="max-width: 200px">
                {{ item.description }}
              </div>
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            <template v-slot:item.updated_at="{ item }">
              {{ formatDate(item.updated_at) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-tooltip text="查看详情" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    density="comfortable"
                    variant="text"
                    color="info"
                    @click="viewAttractionDetail(item)"
                    rounded="pill"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="编辑景点" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    density="comfortable"
                    variant="text"
                    color="blue"
                    @click="openEditDialog(item)"
                    rounded="pill"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="删除景点" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    density="comfortable"
                    variant="text"
                    color="red"
                    @click="confirmDelete(item)"
                    rounded="pill"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>

          <!-- 分页 -->
          <AppPagination
            v-model:page="page"
            :pageSize="pageSize"
            :totalItems="totalAttractions || 0"
            emptyText="暂无景点数据"
            emptyIcon="mdi-map-marker-off-outline"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- 添加/编辑景点对话框 -->
    <AppDialog
      v-model:show="dialog"
      :title="isEditing ? '编辑景点' : '添加景点'"
      :loading="saving"
      persistent
      @confirm="saveAttraction"
      @cancel="closeDialog"
    >
      <v-form ref="form" @submit.prevent="saveAttraction">
        <v-text-field
          v-model="editedAttraction.name"
          label="景点名称"
          required
          :rules="[(v: string) => !!v || '景点名称不能为空']"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-textarea
          v-model="editedAttraction.description"
          label="景点描述"
          required
          :rules="[(v: string) => !!v || '景点描述不能为空']"
          variant="outlined"
          class="mb-3"
          auto-grow
          rows="3"
        ></v-textarea>
        <v-text-field
          v-model="editedAttraction.open_time"
          label="开放时间"
          placeholder="09:00-18:00"
          required
          :rules="[(v: string) => !!v || '开放时间不能为空']"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-text-field
          v-model="editedAttraction.image_url"
          label="图片URL"
          placeholder="/images/new.jpg"
          hint="如果为空则使用默认图片"
          persistent-hint
          variant="outlined"
        ></v-text-field>
      </v-form>
    </AppDialog>

    <!-- 删除确认对话框 -->
    <AppDialog
      v-model:show="deleteDialog"
      title="确认删除"
      confirmText="删除"
      :loading="deleting"
      persistent
      @confirm="deleteAttraction"
    >
      <p>
        您确定要删除景点
        <strong>{{ attractionToDelete?.name }}</strong> 吗？此操作不可恢复。
      </p>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { attractionApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';
import AppPagination from '../components/AppPagination.vue';

// 景点类型定义
interface Attraction {
  id: number;
  name: string;
  description: string;
  open_time: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// 表格列定义
const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '80px' },
  { title: '图片', key: 'image_url', sortable: false, width: '100px' },
  { title: '名称', key: 'name', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '开放时间', key: 'open_time', sortable: false },
  { title: '创建时间', key: 'created_at', sortable: true },
  { title: '更新时间', key: 'updated_at', sortable: true },
  {
    title: '操作',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: '150px',
  },
];

// 状态变量
const router = useRouter();
const attractions = ref<Attraction[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalAttractions = ref(0);
const searchKeyword = ref('');

// 对话框状态
const dialog = ref(false);
const isEditing = ref(false);
const editedAttraction = reactive<Attraction>({
  id: 0,
  name: '',
  description: '',
  open_time: '',
  image_url: '',
  created_at: '',
  updated_at: '',
});
const form = ref(null);
const saving = ref(false);

// 删除对话框状态
const deleteDialog = ref(false);
const attractionToDelete = ref<Attraction | null>(null);
const deleting = ref(false);

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(() => {
  loadAttractions();
});

// 加载景点列表
const loadAttractions = async () => {
  loading.value = true;
  try {
    const result = await attractionApi.query({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
    });

    if (result.success && result.data?.data) {
      attractions.value = result.data.data.attractions;
      totalAttractions.value = result.data.data.total;
    } else {
      showError(result.error || '加载景点列表失败');
    }
  } catch (error) {
    showError(
      '加载景点列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('zh-CN') +
    ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );
};

// 打开添加景点对话框
const openAddDialog = () => {
  isEditing.value = false;
  editedAttraction.id = 0;
  editedAttraction.name = '';
  editedAttraction.description = '';
  editedAttraction.open_time = '';
  editedAttraction.image_url = '';
  editedAttraction.created_at = '';
  editedAttraction.updated_at = '';
  dialog.value = true;
};

// 打开编辑景点对话框
const openEditDialog = (attraction: Attraction) => {
  isEditing.value = true;
  editedAttraction.id = attraction.id;
  editedAttraction.name = attraction.name;
  editedAttraction.description = attraction.description;
  editedAttraction.open_time = attraction.open_time;
  editedAttraction.image_url = attraction.image_url;
  editedAttraction.created_at = attraction.created_at;
  editedAttraction.updated_at = attraction.updated_at;
  dialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
  dialog.value = false;
};

// 保存景点
const saveAttraction = async () => {
  // 表单验证
  const formEl = form.value as any;
  if (formEl && !(await formEl.validate()).valid) {
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      // 更新景点
      const result = await attractionApi.update({
        id: editedAttraction.id,
        name: editedAttraction.name,
        description: editedAttraction.description,
        open_time: editedAttraction.open_time,
        image_url: editedAttraction.image_url,
      });

      if (result.success) {
        showSuccess('景点更新成功');
        loadAttractions();
        dialog.value = false;
      } else {
        showError(result.error || '更新景点失败');
      }
    } else {
      // 添加新景点
      const result = await attractionApi.add({
        name: editedAttraction.name,
        description: editedAttraction.description,
        open_time: editedAttraction.open_time,
        image_url: editedAttraction.image_url || '/images/new.jpg',
      });

      if (result.success) {
        showSuccess('景点添加成功');
        loadAttractions();
        dialog.value = false;
      } else {
        showError(result.error || '添加景点失败');
      }
    }
  } catch (error) {
    showError(
      '操作失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    saving.value = false;
  }
};

// 确认删除景点
const confirmDelete = (attraction: Attraction) => {
  attractionToDelete.value = attraction;
  deleteDialog.value = true;
};

// 删除景点
const deleteAttraction = async () => {
  if (!attractionToDelete.value) return;

  deleting.value = true;
  try {
    const result = await attractionApi.delete({
      id: attractionToDelete.value.id,
    });

    if (result.success) {
      showSuccess('景点删除成功');
      loadAttractions();
      deleteDialog.value = false;
    } else {
      showError(result.error || '删除景点失败');
    }
  } catch (error) {
    showError(
      '删除失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    deleting.value = false;
  }
};

// 查看景点详情
const viewAttractionDetail = (attraction: Attraction) => {
  router.push(`/attractions/${attraction.id}`);
};

// 显示成功消息
const showSuccess = (message: string) => {
  snackbarText.value = message;
  snackbarColor.value = 'success';
  snackbar.value = true;
};

// 显示错误消息
const showError = (message: string) => {
  snackbarText.value = message;
  snackbarColor.value = 'error';
  snackbar.value = true;
};
</script>

<style scoped>
.v-data-table :deep(th) {
  font-weight: 600 !important;
  white-space: nowrap;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 0 16px !important;
}

.v-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid var(--card-border);
  background: var(--md-surface);
}
</style>
