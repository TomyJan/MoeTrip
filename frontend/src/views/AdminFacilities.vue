<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">设施管理</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="搜索设施"
          @search="loadFacilities"
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
                @update:model-value="loadFacilities"
                clearable
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="2" class="text-right">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openAddDialog"
                rounded="pill"
              >
                添加设施
              </v-btn>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 设施列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="facilities"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
            :page="page"
            :items-per-page-options="[10, 20, 50]"
            @update:page="
              page = $event;
              loadFacilities();
            "
            @update:items-per-page="
              pageSize = $event;
              page = 1;
              loadFacilities();
            "
            :server-items-length="totalFacilities || 0"
          >
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                rounded="pill"
              >
                {{ statusMap[item.status] || item.status }}
              </v-chip>
            </template>
            <template v-slot:item.attraction_id="{ item }">
              {{ getAttractionName(item.attraction_id) }}
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            <template v-slot:item.updated_at="{ item }">
              {{ formatDate(item.updated_at) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-tooltip text="编辑设施" location="top">
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
              <v-tooltip text="删除设施" location="top">
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
        </v-card>
      </v-col>
    </v-row>

    <!-- 添加/编辑设施对话框 -->
    <AppDialog
      v-model:show="dialog"
      :title="isEditing ? '编辑设施' : '添加设施'"
      :loading="saving"
      persistent
      @confirm="saveFacility"
      @cancel="closeDialog"
    >
      <v-form ref="form" @submit.prevent="saveFacility">
        <v-select
          v-model="editedFacility.attraction_id"
          :items="attractionOptions"
          item-title="name"
          item-value="id"
          label="所属景点"
          required
          :rules="[(v: number) => !!v || '请选择所属景点']"
          variant="outlined"
          class="mb-3"
        ></v-select>
        <v-text-field
          v-model="editedFacility.name"
          label="设施名称"
          required
          :rules="[(v: string) => !!v || '设施名称不能为空']"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-text-field
          v-model="editedFacility.location"
          label="设施位置"
          required
          :rules="[(v: string) => !!v || '设施位置不能为空']"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-select
          v-model="editedFacility.status"
          :items="statusOptions"
          item-title="text"
          item-value="value"
          label="设施状态"
          required
          :rules="[(v: string) => !!v || '设施状态不能为空']"
          variant="outlined"
        ></v-select>
      </v-form>
    </AppDialog>

    <!-- 删除确认对话框 -->
    <AppDialog
      v-model:show="deleteDialog"
      title="确认删除"
      confirmText="删除"
      :loading="deleting"
      persistent
      @confirm="deleteFacility"
    >
      <p>
        您确定要删除设施
        <strong>{{ facilityToDelete?.name }}</strong> 吗？此操作不可恢复。
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
import { facilityApi, attractionApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

// 设施类型定义
interface Facility {
  id: number;
  name: string;
  location: string;
  status: string;
  attraction_id: number;
  created_at: string;
  updated_at: string;
}

// 景点类型定义
interface Attraction {
  id: number;
  name: string;
}

// 表格列定义
const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '80px' },
  { title: '名称', key: 'name', sortable: true },
  { title: '位置', key: 'location', sortable: false },
  { title: '状态', key: 'status', sortable: true },
  { title: '所属景点', key: 'attraction_id', sortable: true },
  { title: '创建时间', key: 'created_at', sortable: true },
  { title: '更新时间', key: 'updated_at', sortable: true },
  {
    title: '操作',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: '120px',
  },
];

// 状态变量
const facilities = ref<Facility[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalFacilities = ref(0);
const searchKeyword = ref('');
const selectedAttraction = ref<number | null>(null);
const attractionOptions = ref<Attraction[]>([]);

// 状态映射
const statusOptions = [
  { text: '正常', value: 'normal' },
  { text: '维护', value: 'maintenance' },
];

// 状态中英文映射
const statusMap: Record<string, string> = {
  normal: '正常',
  maintenance: '维护',
};

// 对话框状态
const dialog = ref(false);
const isEditing = ref(false);
const editedFacility = reactive<Facility>({
  id: 0,
  name: '',
  location: '',
  status: 'normal',
  attraction_id: 0,
  created_at: '',
  updated_at: '',
});
const form = ref(null);
const saving = ref(false);

// 删除对话框状态
const deleteDialog = ref(false);
const facilityToDelete = ref<Facility | null>(null);
const deleting = ref(false);

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(() => {
  loadAttractions();
  loadFacilities();
});

// 加载景点列表
const loadAttractions = async () => {
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
};

// 加载设施列表
const loadFacilities = async () => {
  loading.value = true;
  try {
    const result = await facilityApi.query({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      attraction_id: selectedAttraction.value || undefined,
    });

    if (result.success && result.data?.data) {
      facilities.value = result.data.data.facilities;
      totalFacilities.value = result.data.data.total;
    } else {
      showError(result.error || '加载设施列表失败');
    }
  } catch (error) {
    showError(
      '加载设施列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
};

// 获取景点名称
const getAttractionName = (attractionId: number): string => {
  const attraction = attractionOptions.value.find((a) => a.id === attractionId);
  return attraction ? attraction.name : `景点#${attractionId}`;
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

// 打开添加设施对话框
const openAddDialog = () => {
  isEditing.value = false;
  editedFacility.id = 0;
  editedFacility.name = '';
  editedFacility.location = '';
  editedFacility.status = 'normal';
  editedFacility.attraction_id = selectedAttraction.value || (null as any);
  editedFacility.created_at = '';
  editedFacility.updated_at = '';
  dialog.value = true;
};

// 打开编辑设施对话框
const openEditDialog = (facility: Facility) => {
  isEditing.value = true;
  editedFacility.id = facility.id;
  editedFacility.name = facility.name;
  editedFacility.location = facility.location;
  editedFacility.status = facility.status;
  editedFacility.attraction_id = facility.attraction_id;
  editedFacility.created_at = facility.created_at;
  editedFacility.updated_at = facility.updated_at;
  dialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
  dialog.value = false;
};

// 保存设施
const saveFacility = async () => {
  // 表单验证
  const formEl = form.value as any;
  if (formEl && !(await formEl.validate()).valid) {
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      // 更新设施
      const result = await facilityApi.update({
        id: editedFacility.id,
        name: editedFacility.name,
        location: editedFacility.location,
        status: editedFacility.status,
        attraction_id: editedFacility.attraction_id,
      });

      if (result.success) {
        showSuccess('设施更新成功');
        loadFacilities();
        dialog.value = false;
      } else {
        showError(result.error || '更新设施失败');
      }
    } else {
      // 添加新设施
      const result = await facilityApi.add({
        name: editedFacility.name,
        location: editedFacility.location,
        status: editedFacility.status,
        attraction_id: editedFacility.attraction_id,
      });

      if (result.success) {
        showSuccess('设施添加成功');
        loadFacilities();
        dialog.value = false;
      } else {
        showError(result.error || '添加设施失败');
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

// 确认删除设施
const confirmDelete = (facility: Facility) => {
  facilityToDelete.value = facility;
  deleteDialog.value = true;
};

// 删除设施
const deleteFacility = async () => {
  if (!facilityToDelete.value) return;

  deleting.value = true;
  try {
    const result = await facilityApi.delete({
      id: facilityToDelete.value.id,
    });

    if (result.success) {
      showSuccess('设施删除成功');
      loadFacilities();
      deleteDialog.value = false;
    } else {
      showError(result.error || '删除设施失败');
    }
  } catch (error) {
    showError(
      '删除失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    deleting.value = false;
  }
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

// 获取状态颜色
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'success';
    case 'maintenance':
      return 'warning';
    default:
      return 'grey';
  }
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
