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
          variant="elevated"
          class="md3-pagination"
        ></v-pagination>
      </v-col>
    </v-row>
    
    <v-row v-else-if="showEmpty">
      <v-col cols="12" class="text-center py-8">
        <v-icon :icon="emptyIcon" size="large" color="secondary"></v-icon>
        <p class="mt-2 text-md-body-1 text-medium-emphasis">{{ emptyText }}</p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  page: number
  pageSize: number
  totalItems: number
  showEmpty?: boolean
  emptyText?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  showEmpty: true,
  emptyText: '暂无数据',
  emptyIcon: 'mdi-alert-circle-outline'
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const currentPage = ref(props.page)

watch(() => props.page, (newValue) => {
  currentPage.value = newValue
})

function onPageChange(page: number) {
  emit('update:page', page)
}
</script>

<style scoped>
.md3-pagination :deep(.v-pagination__item) {
  font-weight: 500;
  min-width: 36px;
  height: 36px;
}

.md3-pagination :deep(.v-pagination__item--is-active) {
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
