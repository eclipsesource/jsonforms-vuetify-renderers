<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { getCustomThemes } from '@/plugins/vuetify';

const appStore = useAppStore();

// Define async components
const DefaultAppBar = defineAsyncComponent(() => import('./AppBar.vue'));
const DefaultDrawer = defineAsyncComponent(() => import('./Drawer.vue'));
const DefaultSettings = defineAsyncComponent(
  () => import('../../components/Settings.vue'),
);
const DefaultView = defineAsyncComponent(() => import('./View.vue'));

const route = useRoute();

// Computed property
const formonly = computed(() => route.query?.view === 'form-only');

const theme = computed(() => {
  const theme = getCustomThemes(appStore.blueprint).filter(
    (t) => t.name === appStore.theme,
  );
  if (theme && theme[0] && theme[0].dark === appStore.dark) {
    return theme[0].name;
  }

  return appStore.dark ? 'dark' : 'light';
});
</script>

<template>
  <v-locale-provider :rtl="appStore.rtl">
    <v-theme-provider :theme="theme">
      <v-app>
        <default-app-bar v-if="!formonly" />

        <default-drawer v-if="!formonly" />

        <default-settings v-if="!formonly" />
        <default-view />
      </v-app>
    </v-theme-provider>
  </v-locale-provider>
</template>
