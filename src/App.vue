<script setup lang="ts">
import { ref } from 'vue';
import BootSplash from './components/BootSplash.vue';
import TopBar from './components/TopBar.vue';
import LifeWidget from './components/LifeWidget.vue';
import StarField from './components/StarField.vue';

const bootDone = ref(false);
</script>

<template>
  <div class="fi-grid-bg relative min-h-screen bg-[var(--fi-bg)]">
    <StarField />

    <BootSplash v-if="!bootDone" @done="bootDone = true" />

    <TopBar v-show="bootDone" />

    <main class="relative z-10 pb-28 pt-20">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <LifeWidget v-show="bootDone" />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
