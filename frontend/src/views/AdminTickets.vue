<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">票种管理</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="搜索票种"
          @search="loadTickets"
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
                @update:model-value="loadTickets"
                :rules="[() => true]"
                clearable
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="2" class="text-right">
              <v-btn
                color="primary"
                prepend-icon="mdi-ticket-plus"
                @click="openAddDialog"
                rounded="pill"
              >
                添加票种
              </v-btn>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 票种列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="tickets"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
            :page="page"
            :items-per-page-options="[10, 20, 50]"
            @update:page="
              page = $event;
              loadTickets();
            "
            @update:items-per-page="
              pageSize = $event;
              page = 1;
              loadTickets();
            "
            :server-items-length="totalTickets || 0"
          >
            <template v-slot:item.price="{ item }">
              <span
                >¥{{
                  typeof item.price === 'number'
                    ? item.price.toFixed(2)
                    : item.price
                }}</span
              >
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                rounded="pill"
              >
                {{ getStatusText(item.status) }}
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
              <v-tooltip text="编辑票种" location="top">
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
              <v-tooltip text="删除票种" location="top">
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

    <!-- 添加/编辑票种对话框 -->
    <AppDialog
      v-model:show="dialog"
      :title="isEditing ? '编辑票种' : '添加票种'"
      :loading="saving"
      persistent
      @confirm="saveTicket"
      @cancel="closeDialog"
    >
      <v-form ref="form" @submit.prevent="saveTicket">
        <v-select
          v-if="!isEditing"
          v-model="editedTicket.attraction_id"
          :items="attractionOptions"
          item-title="name"
          item-value="id"
          label="所属景点"
          required
          :rules="[(v: any) => !!v || '请选择所属景点']"
          variant="outlined"
          class="mb-3"
          :disabled="!!selectedAttraction"
        ></v-select>
        <v-text-field
          v-model="editedTicket.name"
          label="票种名称"
          required
          :rules="[(v: string) => !!v || '票种名称不能为空']"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-text-field
          v-model.number="editedTicket.price"
          label="价格"
          required
          type="number"
          prefix="¥"
          :rules="[
            (v: number) => !!v || '价格不能为空',
            (v: number) => v > 0 || '价格必须大于0',
          ]"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-text-field
          v-model.number="editedTicket.available"
          label="每日限额"
          required
          type="number"
          :rules="[
            (v: number) => !!v || '每日限额不能为空',
            (v: number) => v > 0 || '每日限额必须大于0',
          ]"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-select
          v-if="isEditing"
          v-model="editedTicket.status"
          :items="statusOptions"
          item-title="text"
          item-value="value"
          label="状态"
          required
          :rules="[(v: string) => !!v || '状态不能为空']"
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
      @confirm="deleteTicket"
    >
      <p>
        您确定要删除票种
        <strong>{{ ticketToDelete?.name }}</strong> 吗？此操作不可恢复。
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
import { ref, reactive, onMounted, watch } from 'vue';
import { ticketApi, attractionApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';

// 票种类型定义
interface Ticket {
  id: number;
  name: string;
  available: number; // API返回的是available
  attraction_id: number;
  created_at: string;
  updated_at: string;
  status?: string; // 可能不存在
  price?: number; // 可能不存在
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
  { title: '价格', key: 'price', sortable: true },
  { title: '每日限额', key: 'available', sortable: true }, // 使用API返回的字段名
  { title: '状态', key: 'status', sortable: true },
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
const tickets = ref<Ticket[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalTickets = ref(0);
const searchKeyword = ref('');
const selectedAttraction = ref<number | null>(null);
const attractionOptions = ref<Attraction[]>([]);

// 状态选项
const statusOptions = [
  { text: '正常', value: 'active' },
  { text: '已下架', value: 'inactive' },
];

// 对话框状态
const dialog = ref(false);
const isEditing = ref(false);
const editedTicket = reactive({
  id: 0,
  name: '',
  price: 0,
  available: 0, // 使用API的available字段
  status: 'active',
  attraction_id: 0,
});
const form = ref(null);
const saving = ref(false);

// 删除对话框状态
const deleteDialog = ref(false);
const ticketToDelete = ref<Ticket | null>(null);
const deleting = ref(false);

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(async () => {
  await loadAttractions();
  loadTickets(); // 直接加载所有票种
});

// 监听景点选择
watch(selectedAttraction, () => {
  loadTickets();
});

// 加载景点列表
async function loadAttractions() {
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
}

// 加载票种列表
async function loadTickets() {
  loading.value = true;
  try {
    // 构建查询参数，不选择景点时查询所有票种
    const params: any = {};
    if (selectedAttraction.value) {
      params.attraction_id = selectedAttraction.value;
    }

    const result = await ticketApi.query(params);

    if (result.success && result.data?.data) {
      tickets.value = result.data.data.tickets || [];

      // 修正数据类型，确保price是数字
      tickets.value = tickets.value.map((ticket) => ({
        ...ticket,
        price:
          typeof ticket.price === 'number'
            ? ticket.price
            : parseFloat(ticket.price || '0'),
        status: ticket.status || 'active',
      }));

      // 应用搜索过滤
      if (searchKeyword.value) {
        tickets.value = tickets.value.filter((ticket) =>
          ticket.name.includes(searchKeyword.value),
        );
      }

      totalTickets.value = tickets.value.length;

      console.log('加载到的票种数据:', tickets.value);
    } else {
      showError(result.error || '加载票种列表失败');
    }
  } catch (error) {
    console.error('加载票种列表失败:', error);
    showError(
      '加载票种列表失败: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    loading.value = false;
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.text : status;
}

// 获取状态颜色
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    default:
      return 'grey';
  }
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('zh-CN') +
    ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );
}

// 打开添加票种对话框
function openAddDialog() {
  isEditing.value = false;
  editedTicket.id = 0;
  editedTicket.name = '';
  editedTicket.price = 0;
  editedTicket.available = 0; // 使用available
  editedTicket.status = 'active';
  editedTicket.attraction_id = selectedAttraction.value || 0;
  dialog.value = true;
}

// 打开编辑票种对话框
function openEditDialog(ticket: Ticket) {
  isEditing.value = true;
  editedTicket.id = ticket.id;
  editedTicket.name = ticket.name;
  editedTicket.price =
    typeof ticket.price === 'number'
      ? ticket.price
      : parseFloat(ticket.price || '0');
  editedTicket.available = ticket.available; // 直接使用available
  editedTicket.status = ticket.status || 'active';
  editedTicket.attraction_id = ticket.attraction_id;
  dialog.value = true;
}

// 关闭对话框
function closeDialog() {
  dialog.value = false;
}

// 保存票种
async function saveTicket() {
  // 表单验证
  const formEl = form.value as any;
  if (formEl && !(await formEl.validate()).valid) {
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      // 更新票种
      const result = await ticketApi.update({
        id: editedTicket.id,
        name: editedTicket.name,
        price: editedTicket.price,
        daily_limit: editedTicket.available, // 映射到daily_limit
        status: editedTicket.status,
      });

      if (result.success) {
        showSuccess('票种更新成功');
        loadTickets();
        dialog.value = false;
      } else {
        showError(result.error || '更新票种失败');
      }
    } else {
      // 添加新票种
      const result = await ticketApi.add({
        attraction_id: editedTicket.attraction_id,
        name: editedTicket.name,
        price: editedTicket.price,
        daily_limit: editedTicket.available, // 映射到daily_limit
      });

      if (result.success) {
        showSuccess('票种添加成功');
        loadTickets();
        dialog.value = false;
      } else {
        showError(result.error || '添加票种失败');
      }
    }
  } catch (error) {
    showError(
      '操作失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    saving.value = false;
  }
}

// 确认删除票种
function confirmDelete(ticket: Ticket) {
  ticketToDelete.value = ticket;
  deleteDialog.value = true;
}

// 删除票种
async function deleteTicket() {
  if (!ticketToDelete.value) return;

  deleting.value = true;
  try {
    const result = await ticketApi.delete({
      id: ticketToDelete.value.id,
    });

    if (result.success) {
      showSuccess('票种删除成功');
      loadTickets();
      deleteDialog.value = false;
    } else {
      showError(result.error || '删除票种失败');
    }
  } catch (error) {
    showError(
      '删除失败: ' + (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    deleting.value = false;
  }
}

// 显示成功消息
function showSuccess(message: string) {
  snackbarText.value = message;
  snackbarColor.value = 'success';
  snackbar.value = true;
}

// 显示错误消息
function showError(message: string) {
  snackbarText.value = message;
  snackbarColor.value = 'error';
  snackbar.value = true;
}

// 获取景点名称
function getAttractionName(attractionId: number): string {
  const attraction = attractionOptions.value.find((a) => a.id === attractionId);
  return attraction ? attraction.name : `景点#${attractionId}`;
}
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
