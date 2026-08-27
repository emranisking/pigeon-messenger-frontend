<script setup>
import { computed } from 'vue'
import { getAvatarColor, getInitial } from '../../utils/avatar'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 40 },
  isGroup: { type: Boolean, default: false }
})

const bg = computed(() => getAvatarColor(props.name))
const initial = computed(() => getInitial(props.name))
</script>

<template>
  <div
    class="avatar"
    :style="{ width: size + 'px', height: size + 'px', background: bg, fontSize: Math.max(11, size * 0.4) + 'px' }"
  >
    {{ initial }}
    <span v-if="isGroup" class="avatar__badge" aria-hidden="true">👥</span>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
  text-transform: uppercase;
  position: relative;
  user-select: none;
}
.avatar__badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 10px;
  background: var(--bg);
  border-radius: 50%;
  padding: 1px;
  line-height: 1;
}
</style>
