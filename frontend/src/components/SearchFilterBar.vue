<template>
  <v-row class="mb-4">
    <slot name="filters"></slot>
    
    <v-col :cols="searchColSize">
      <v-text-field
        v-model="searchTerm"
        :label="searchLabel"
        prepend-inner-icon="mdi-magnify"
        hide-details
        density="compact"
        variant="outlined"
        @keyup.enter="onSearch"
      ></v-text-field>
    </v-col>
    
    <v-col :cols="buttonColSize">
      <v-btn 
        color="primary"
        block
        @click="onSearch"
      >
        {{ searchButtonText }}
      </v-btn>
    </v-col>
    
    <slot name="actions"></slot>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  initialSearchTerm?: string
  searchLabel?: string
  searchButtonText?: string
  searchColSize?: number
  buttonColSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialSearchTerm: '',
  searchLabel: '搜索',
  searchButtonText: '搜索',
  searchColSize: 4,
  buttonColSize: 2
})

const emit = defineEmits<{
  (e: 'search', term: string): void
  (e: 'update:searchTerm', term: string): void
}>()

const searchTerm = ref(props.initialSearchTerm)

watch(() => props.initialSearchTerm, (newValue) => {
  searchTerm.value = newValue
})

watch(searchTerm, (newValue) => {
  emit('update:searchTerm', newValue)
})

function onSearch() {
  emit('search', searchTerm.value)
}
</script>
