<template>
  <v-card
    class="mb-4 attraction-card"
    @click="$emit('view')"
    variant="elevated"
    rounded="lg"
  >
    <v-img
      :src="attraction.image_url || '/images/new.jpg'"
      height="200px"
      cover
      class="rounded-t-lg"
    ></v-img>

    <v-card-title class="text-md-h6">{{ attraction.name }}</v-card-title>

    <v-card-text>
      <p>{{ attraction.description }}</p>
      <p class="mt-2 d-flex align-center text-md-body-1">
        <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
        <span>开放时间: {{ attraction.open_time }}</span>
      </p>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        icon
        rounded="pill"
        size="small"
        :ripple="false"
        @click.stop="expanded = !expanded"
      >
        <v-icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        ></v-icon>
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-if="expanded">
        <v-divider></v-divider>
        <v-card-text>
          <p class="text-subtitle-1 mb-2">设施信息:</p>
          <v-chip-group>
            <v-chip
              v-for="facility in facilities || ['休息区', '卫生间', '售票处']"
              :key="facility"
              variant="elevated"
              color="secondary"
              size="small"
              rounded="pill"
            >
              {{ facility }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Attraction {
  id: number;
  name: string;
  description: string;
  open_time: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  attraction: Attraction;
  facilities?: string[];
}

defineProps<Props>();

defineEmits<{
  (e: 'view'): void;
}>();

const expanded = ref(false);
</script>

<style scoped>
.attraction-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  /* 使用全局定义的阴影和边框变量 */
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow-light);
  background: var(--md-surface);
}

.attraction-card:hover {
  transform: translateY(-4px);
  /* 使用全局定义的悬停阴影 */
  box-shadow: var(--card-shadow-hover);
}

:deep(.v-card-title) {
  color: var(--md-primary);
}

:deep(.v-card-text) {
  color: var(--text-color);
}
</style>
