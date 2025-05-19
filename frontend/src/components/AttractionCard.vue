<template>
  <v-card
    class="mb-4 attraction-card"
    @click="$emit('view')"
    variant="elevated"
    rounded="lg"
    elevation="1"
  >
    <v-img
      :src="attraction.image_url || '/images/new.jpg'"
      height="200px"
      cover
      class="rounded-t-lg"
      :gradient="
        isDarkMode
          ? 'to bottom, rgba(0,0,0,0.0), rgba(28,27,31,0.6)'
          : 'to bottom, rgba(255,255,255,0.0), rgba(255,251,254,0.6)'
      "
    ></v-img>

    <v-card-title class="md-title-large">{{ attraction.name }}</v-card-title>

    <v-card-text>
      <p class="md-body-medium">{{ attraction.description }}</p>
      <div class="mt-3 d-flex align-center time-info">
        <v-icon
          icon="mdi-clock-outline"
          size="small"
          class="mr-2"
          color="primary"
        ></v-icon>
        <span class="md-body-medium">开放时间: {{ attraction.open_time }}</span>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        icon
        density="comfortable"
        class="expand-btn"
        :ripple="false"
        @click.stop="expanded = !expanded"
      >
        <v-icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        ></v-icon>
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-if="expanded" class="expanded-content">
        <v-divider></v-divider>
        <v-card-text>
          <p class="md-title-small mb-3">设施信息</p>
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
                variant="tonal"
                color="secondary"
                size="small"
                rounded="pill"
                class="facility-chip"
                @click.stop="toggleFacility(facility)"
                :class="{
                  'selected-chip': selectedFacility?.id === facility.id,
                }"
              >
                {{ facility.name }}
              </v-chip>
            </v-chip-group>

            <div v-if="selectedFacility" class="mt-3 facility-location">
              <v-alert
                density="comfortable"
                type="info"
                variant="tonal"
                rounded="lg"
                class="md-body-small pa-3"
                border="start"
                color="primary"
              >
                <div class="d-flex justify-space-between align-center">
                  <strong class="md-title-small">{{
                    selectedFacility.name
                  }}</strong>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    density="comfortable"
                    @click.stop="selectedFacility = null"
                    class="close-btn"
                  >
                    <v-icon size="small">mdi-close</v-icon>
                  </v-btn>
                </div>
                <div class="mt-1">位置: {{ selectedFacility.location }}</div>
              </v-alert>
            </div>
          </div>
          <p v-else class="text-medium-emphasis md-body-small">暂无设施信息</p>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { facilityApi } from '../utils/api';
import { useThemeStore } from '../stores';

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

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

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
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid var(--md-outline-variant);
  box-shadow: var(--md-shadow-1);
  background: var(--md-surface);
  position: relative;
  overflow: hidden;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-2);
}

.time-info {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: var(--md-surface-variant);
  color: var(--md-on-surface-variant);
  border-radius: 8px;
  display: inline-flex;
}

.facility-chip {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  margin: 4px;
}

.selected-chip {
  background-color: var(--md-secondary-container) !important;
  color: var(--md-on-secondary-container) !important;
  box-shadow: var(--md-shadow-1);
  transform: translateY(-2px);
}

.facility-location {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-content {
  background-color: var(--md-surface-1);
  border-top: 1px solid var(--md-outline-variant);
}

.expand-btn {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-btn:hover {
  background-color: var(--md-surface-variant);
}

.close-btn:hover {
  background-color: var(--md-error-container);
  color: var(--md-on-error-container);
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
