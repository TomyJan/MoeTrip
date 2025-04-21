<template>
  <v-card height="100%" class="feature-card">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>{{ description }}</v-card-text>
    <v-card-actions>
      <v-btn :to="link" color="primary" variant="flat">
        {{ buttonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  link: string
  buttonText?: string
}

defineProps<Props>()
</script>

<style scoped>
.feature-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style> 