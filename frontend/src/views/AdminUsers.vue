<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">用户管理</h1>

        <!-- 操作栏 -->
        <SearchFilterBar
          v-model:searchTerm="searchKeyword"
          searchLabel="搜索用户"
          @search="loadUsers"
        >
          <template #filters>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedRole"
                :items="roles"
                label="用户角色"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="loadUsers"
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="2" class="text-right">
              <v-btn
                color="primary"
                prepend-icon="mdi-account-plus"
                @click="openAddDialog"
                rounded="pill"
              >
                添加用户
              </v-btn>
            </v-col>
          </template>
        </SearchFilterBar>

        <!-- 用户列表 -->
        <v-card rounded="lg" elevation="1" class="mt-4">
          <v-data-table
            :headers="headers"
            :items="users"
            :loading="loading"
            :items-per-page="pageSize"
            class="elevation-0"
          >
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="item.role === 'admin' ? 'error' : 'success'"
                size="small"
                class="text-uppercase"
                rounded="pill"
              >
                {{ item.role === 'admin' ? '管理员' : '普通用户' }}
              </v-chip>
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            <template v-slot:item.updated_at="{ item }">
              {{ formatDate(item.updated_at) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-tooltip text="编辑用户" location="top">
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
              <v-tooltip text="删除用户" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    density="comfortable"
                    variant="text"
                    color="red"
                    @click="confirmDelete(item)"
                    :disabled="
                      item.id === currentUserId || item.username === 'TomyJan'
                    "
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
            :totalItems="totalUsers || 0"
            emptyText="暂无用户数据"
            emptyIcon="mdi-account-off-outline"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- 添加/编辑用户对话框 -->
    <AppDialog
      v-model:show="dialog"
      :title="isEditing ? '编辑用户' : '添加用户'"
      :loading="saving"
      persistent
      @confirm="saveUser"
      @cancel="closeDialog"
    >
      <v-form ref="form" @submit.prevent="saveUser">
        <v-text-field
          v-model="editedUser.username"
          label="用户名"
          required
          :rules="[
            (v: string) => !!v || '用户名不能为空',
            (v: string) => (v && v.length >= 3) || '用户名最少3个字符',
            (v: string) => (v && v.length <= 50) || '用户名最多50个字符',
          ]"
          :disabled="isEditing"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-text-field
          v-if="!isEditing"
          v-model="editedUser.password"
          label="密码"
          :type="showPassword ? 'text' : 'password'"
          required
          :rules="[
            (v: string) => !!v || '密码不能为空',
            (v: string) => (v && v.length >= 6) || '密码最少6个字符',
          ]"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          class="mb-3"
        ></v-text-field>
        <v-select
          v-model="editedUser.role"
          :items="roles.filter((r) => r !== '')"
          label="用户角色"
          required
          :rules="[(v: string) => !!v || '角色不能为空']"
          :disabled="editedUser.username === 'TomyJan'"
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
      @confirm="deleteUser"
    >
      <p>
        您确定要删除用户
        <strong>{{ userToDelete?.username }}</strong> 吗？此操作不可恢复。
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
import { useUserStore } from '../stores';
import { adminApi } from '../utils/api';
import SearchFilterBar from '../components/SearchFilterBar.vue';
import AppDialog from '../components/AppDialog.vue';
import AppSnackbar from '../components/AppSnackbar.vue';
import AppPagination from '../components/AppPagination.vue';
import CryptoJS from 'crypto-js';

// 用户类型定义
interface User {
  id: number;
  username: string;
  role: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

// 表格列定义
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: '用户名', key: 'username', sortable: true },
  { title: '角色', key: 'role', sortable: true },
  { title: '创建时间', key: 'created_at', sortable: true },
  { title: '更新时间', key: 'updated_at', sortable: true },
  { title: '操作', key: 'actions', sortable: false, align: 'end' },
];

// 状态变量
const userStore = useUserStore();
const users = ref<User[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);
const searchKeyword = ref('');
const selectedRole = ref('');
const roles = ['', 'user', 'admin'];
const currentUserId = userStore.id;

// 对话框状态
const dialog = ref(false);
const isEditing = ref(false);
const editedUser = reactive<User>({
  id: 0,
  username: '',
  role: 'user',
  password: '',
  created_at: '',
  updated_at: '',
});
const form = ref(null);
const showPassword = ref(false);
const saving = ref(false);

// 删除对话框状态
const deleteDialog = ref(false);
const userToDelete = ref<User | null>(null);
const deleting = ref(false);

// 消息提示
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 页面初始化时加载数据
onMounted(() => {
  loadUsers();
});

// 加载用户列表
const loadUsers = async () => {
  loading.value = true;
  try {
    const result = await adminApi.queryUsers({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      role: selectedRole.value || undefined,
    });

    if (result.success && result.data?.data) {
      users.value = result.data.data.users;
      totalUsers.value = result.data.data.total;
    } else {
      showError(result.error || '加载用户列表失败');
    }
  } catch (error) {
    showError(
      '加载用户列表失败: ' +
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

// 打开添加用户对话框
const openAddDialog = () => {
  isEditing.value = false;
  editedUser.id = 0;
  editedUser.username = '';
  editedUser.password = '';
  editedUser.role = 'user';
  editedUser.created_at = '';
  editedUser.updated_at = '';
  showPassword.value = false;
  dialog.value = true;
};

// 打开编辑用户对话框
const openEditDialog = (user: User) => {
  isEditing.value = true;
  editedUser.id = user.id;
  editedUser.username = user.username;
  editedUser.role = user.role;
  editedUser.created_at = user.created_at;
  editedUser.updated_at = user.updated_at;
  dialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
  dialog.value = false;
};

// 保存用户
const saveUser = async () => {
  // 表单验证
  const formEl = form.value as any;
  if (formEl && !(await formEl.validate()).valid) {
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      // 更新用户
      const result = await adminApi.updateUser({
        id: editedUser.id,
        role: editedUser.role,
      });

      if (result.success) {
        showSuccess('用户更新成功');
        loadUsers();
        dialog.value = false;
      } else {
        showError(result.error || '更新用户失败');
      }
    } else {
      // 添加新用户
      // 将密码转换为SHA1哈希值
      const passwordHash = CryptoJS.SHA1(editedUser.password || '').toString();
      
      const result = await adminApi.addUser({
        username: editedUser.username,
        password: passwordHash,
        role: editedUser.role,
      });

      if (result.success) {
        showSuccess('用户添加成功');
        loadUsers();
        dialog.value = false;
      } else {
        showError(result.error || '添加用户失败');
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

// 确认删除用户
const confirmDelete = (user: User) => {
  // 禁止删除当前登录用户或管理员
  if (user.id === currentUserId || user.username === 'TomyJan') {
    showError('无法删除当前登录用户或系统管理员');
    return;
  }

  userToDelete.value = user;
  deleteDialog.value = true;
};

// 删除用户
const deleteUser = async () => {
  if (!userToDelete.value) return;

  deleting.value = true;
  try {
    const result = await adminApi.deleteUser({
      id: userToDelete.value.id,
    });

    if (result.success) {
      showSuccess('用户删除成功');
      loadUsers();
      deleteDialog.value = false;
    } else {
      showError(result.error || '删除用户失败');
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
