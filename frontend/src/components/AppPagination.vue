<template>
  <div>
    <v-row v-if="totalItems > 0">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="Math.ceil(totalItems / pageSize)"
          @update:model-value="onPageChange"
          rounded="lg"
          active-color="primary"
          variant="text"
          class="md3-pagination"
          :total-visible="isMobile ? 3 : 7"
        ></v-pagination>
      </v-col>
    </v-row>

    <v-row v-else-if="showEmpty">
      <v-col cols="12" class="text-center py-8">
        <div class="empty-state">
          <v-icon
            :icon="emptyIcon"
            size="large"
            color="outline"
            class="mb-3"
          ></v-icon>
          <p class="md-body-large text-medium-emphasis">{{ emptyText }}</p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  showEmpty?: boolean;
  emptyText?: string;
  emptyIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showEmpty: true,
  emptyText: '暂无数据',
  emptyIcon: 'mdi-alert-circle-outline',
});

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
}>();

const currentPage = ref(props.page);

// 判断是否为移动设备
const isMobile = computed(() => {
  return window.innerWidth < 600;
});

watch(
  () => props.page,
  (newValue) => {
    currentPage.value = newValue;
  },
);

function onPageChange(page: number) {
  emit('update:page', page);
}
</script>

<style scoped>
.md3-pagination {
  margin: 16px 0;
}

.md3-pagination :deep(.v-pagination__item) {
  font-weight: 500;
  min-width: 40px;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--md-on-surface-variant);
  background-color: transparent;
}

.md3-pagination :deep(.v-pagination__item:hover) {
  background-color: var(--md-surface-variant);
}

.md3-pagination :deep(.v-pagination__item--is-active) {
  font-weight: 600;
  background-color: var(--md-primary-container);
  color: var(--md-on-primary-container);
  box-shadow: var(--md-shadow-1);
}

.md3-pagination :deep(.v-pagination__prev),
.md3-pagination :deep(.v-pagination__next) {
  background-color: var(--md-surface-variant);
  border-radius: 20px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.md3-pagination :deep(.v-pagination__prev:hover),
.md3-pagination :deep(.v-pagination__next:hover) {
  background-color: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.empty-state {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--md-surface-1);
  border-radius: 16px;
  border: 1px solid var(--md-outline-variant);
}
</style>
