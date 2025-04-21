<template>
  <v-form @submit.prevent="$emit('submit', { score, comment })">
    <v-rating
      v-model="score"
      color="amber"
      hover
      required
    ></v-rating>
    
    <v-textarea
      v-model="comment"
      label="评价内容"
      placeholder="分享您的游览体验..."
      rows="3"
      counter="500"
      maxlength="500"
    ></v-textarea>
    
    <div class="d-flex justify-end mt-4">
      <v-btn color="grey" class="mr-2" @click="$emit('cancel')">取消</v-btn>
      <v-btn color="primary" type="submit" :loading="loading">提交</v-btn>
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
