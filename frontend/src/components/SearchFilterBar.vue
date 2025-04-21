<template>
  <v-row class="mb-4 align-center">
    <slot name="filters"></slot>

    <v-col :cols="searchColSize">
      <v-text-field
        v-model="searchTerm"
        :label="searchLabel"
        prepend-inner-icon="mdi-magnify"
        hide-details
        variant="outlined"
        density="comfortable"
        bg-color="surface-variant"
        rounded="lg"
        class="search-field"
        @keyup.enter="onSearch"
      ></v-text-field>
    </v-col>

    <v-col :cols="buttonColSize">
      <v-btn
        color="primary"
        variant="tonal"
        block
        rounded="pill"
        class="text-none"
        @click="onSearch"
      >
        <v-icon icon="mdi-magnify" class="mr-1"></v-icon>
        {{ searchButtonText }}
      </v-btn>
    </v-col>

    <slot name="actions"></slot>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  initialSearchTerm?: string;
  searchLabel?: string;
  searchButtonText?: string;
  searchColSize?: number;
  buttonColSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialSearchTerm: '',
  searchLabel: '搜索',
  searchButtonText: '搜索',
  searchColSize: 4,
  buttonColSize: 2,
});

const emit = defineEmits<{
  (e: 'search', term: string): void;
  (e: 'update:searchTerm', term: string): void;
}>();

const searchTerm = ref(props.initialSearchTerm);

watch(
  () => props.initialSearchTerm,
  (newValue) => {
    searchTerm.value = newValue;
  },
);

watch(searchTerm, (newValue) => {
  emit('update:searchTerm', newValue);
});

function onSearch() {
  emit('search', searchTerm.value);
}
</script>

<style scoped>
.search-field :deep(.v-field__outline) {
  opacity: 0.8;
}

.search-field :deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}

/* 调整按钮高度 */
:deep(.v-btn) {
  height: 48px;
}
</style>
