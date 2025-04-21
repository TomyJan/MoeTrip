<template>
  <v-form @submit.prevent="$emit('submit', { score, comment })">
    <p class="text-md-subtitle-1 mb-2">请为您的体验评分</p>
    <v-rating
      v-model="score"
      color="amber-darken-2"
      hover
      half-increments
      size="large"
      class="mb-3"
      required
    ></v-rating>
    
    <v-textarea
      v-model="comment"
      label="评价内容"
      placeholder="分享您的游览体验..."
      rows="3"
      counter="500"
      maxlength="500"
      variant="outlined"
      density="comfortable"
      bg-color="surface-variant"
      rounded="lg"
      class="mb-4 feedback-textarea"
    ></v-textarea>
    
    <div class="d-flex justify-end mt-4">
      <v-btn 
        color="secondary" 
        variant="text" 
        class="mr-3" 
        rounded="pill"
        @click="$emit('cancel')"
      >
        取消
      </v-btn>
      <v-btn 
        color="primary" 
        variant="tonal"
        type="submit" 
        :loading="loading"
        rounded="pill"
      >
        提交评价
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  initialScore?: number
  initialComment?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialScore: 5,
  initialComment: '',
  loading: false
})

defineEmits<{
  (e: 'submit', data: { score: number, comment: string }): void
  (e: 'cancel'): void
}>()

const score = ref(props.initialScore)
const comment = ref(props.initialComment)
</script>

<style scoped>
.feedback-textarea :deep(.v-field__outline) {
  opacity: 0.8;
}

.feedback-textarea :deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.0178571em;
  font-weight: 500;
}
</style>
