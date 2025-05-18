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
          <div v-if="loadingFacilities" class="text-center pa-2">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
            ></v-progress-circular>
          </div>
          <div v-else-if="facilities.length > 0">
            <v-chip-group>
              <v-chip
                v-for="facility in facilities"
                :key="facility.id"
                variant="elevated"
                color="secondary"
                size="small"
                rounded="pill"
                @click.stop="toggleFacility(facility)"
                :class="{
                  'v-chip--selected': selectedFacility?.id === facility.id,
                }"
              >
                {{ facility.name }}
              </v-chip>
            </v-chip-group>

            <div v-if="selectedFacility" class="mt-2 facility-location">
              <v-alert
                density="compact"
                type="info"
                variant="tonal"
                rounded="lg"
                class="text-body-2 pa-2"
              >
                <div class="d-flex justify-space-between align-center">
                  <strong>{{ selectedFacility.name }}</strong>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="selectedFacility = null"
                  >
                    <v-icon size="small">mdi-close</v-icon>
                  </v-btn>
                </div>
                <div>位置: {{ selectedFacility.location }}</div>
              </v-alert>
            </div>
          </div>
          <p v-else class="text-medium-emphasis">暂无设施信息</p>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { facilityApi } from '../utils/api';

interface Attraction {
  id: number;
  name: string;
  description: string;
  open_time: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface Facility {
  id: number;
  name: string;
  location: string;
  status: string;
  attraction_id: number;
}

interface Props {
  attraction: Attraction;
  facilities?: string[];
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'view'): void;
}>();

const expanded = ref(false);
const loadingFacilities = ref(false);
const facilityNames = ref<string[]>([]);
const facilities = ref<Facility[]>([]);
const selectedFacility = ref<Facility | null>(null);

onMounted(() => {
  if (!props.facilities || props.facilities.length === 0) {
    // 如果没有传入设施信息，则加载设施信息
    loadFacilities();
  } else {
    facilityNames.value = props.facilities;
  }
});

async function loadFacilities() {
  if (!props.attraction.id) return;

  loadingFacilities.value = true;
  try {
    const result = await facilityApi.query({
      attraction_id: props.attraction.id,
    });

    if (result.success && result.data?.data?.facilities) {
      // 只显示状态为normal的设施
      facilities.value = result.data.data.facilities.filter(
        (facility: Facility) => facility.status === 'normal',
      );
      facilityNames.value = facilities.value.map((f) => f.name);
    }
  } catch (error) {
    console.error('加载设施信息失败:', error);
  } finally {
    loadingFacilities.value = false;
  }
}

// 切换设施选择
function toggleFacility(facility: Facility) {
  if (selectedFacility.value?.id === facility.id) {
    selectedFacility.value = null;
  } else {
    selectedFacility.value = facility;
  }
}
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

:deep(.v-chip) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.v-chip--selected) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.facility-location {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
