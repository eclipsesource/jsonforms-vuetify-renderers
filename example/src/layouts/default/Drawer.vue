<script setup lang="ts">
import { examples } from '@/examples';
import { useAppStore } from '@/stores/app';
import { useRoute, useRouter } from 'vue-router';
import vuetifyLogo from '@/assets/vuetify.svg';

const appStore = useAppStore();
const route = useRoute();
const router = useRouter();
</script>

<template>
  <v-navigation-drawer
    v-model="appStore.drawer"
    :location="appStore.rtl ? 'right' : 'left'"
  >
    <v-list-item>
      <template v-slot:prepend>
        <v-img
          :src="vuetifyLogo"
          max-height="64"
          max-width="64"
          min-height="64"
          min-width="64"
        />
      </template>
      <v-list-item-title class="text-h6"> Examples </v-list-item-title>
      <v-list-item-subtitle> Vuetify Renderers </v-list-item-subtitle>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="example in examples" :key="example.title" link>
        <v-list-item-title
          @click="
            if (route.name !== 'example' || route.params.id !== example.id)
              router.push({ name: 'example', params: { id: example.id } });
          "
          >{{ example.title }}</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
