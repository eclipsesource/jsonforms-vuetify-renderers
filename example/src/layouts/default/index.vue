<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

// Define async components
const DefaultAppBar = defineAsyncComponent(() => import('./AppBar.vue'));
const DefaultDrawer = defineAsyncComponent(() => import('./Drawer.vue'));
const DefaultSettings = defineAsyncComponent(
  () => import('../../components/Settings.vue')
);
const DefaultView = defineAsyncComponent(() => import('./View.vue'));

const route = useRoute();

// Computed property
const formonly = computed(() => route.query?.view === 'form-only');
</script>

<template>
  <v-locale-provider :rtl="appStore.rtl">
    <v-app>
      <default-app-bar v-if="!formonly" />

      <default-drawer v-if="!formonly" />

      <default-settings v-if="!formonly" />
      <default-view />
    </v-app>
  </v-locale-provider>
</template>
