<script setup lang="ts">
import ThemeChanger from '@/components/ThemeChanger.vue';
import { useAppStore } from '@/stores/app';
import JsonLogo from '@/assets/jsonforms.vue';

const appStore = useAppStore();
</script>

<template>
  <v-app-bar app>
    <v-app-bar-nav-icon
      aria-label="Toggle Navigation Drawer"
      @click="appStore.drawer = !appStore.drawer"
    />

    <v-toolbar-title>
      <v-container fill-height fluid
        ><v-row align="center" justify="center" dense>
          <JsonLogo></JsonLogo>
          <v-col>JSON Forms </v-col>
        </v-row>
      </v-container>
    </v-toolbar-title>

    <v-spacer expand></v-spacer>

    <v-toolbar-items>
      <v-container fill-height fluid justify-end
        ><v-row dense>
          <v-col><theme-changer /> </v-col>
          <v-col>
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  large
                  icon
                  dark
                  v-bind="props"
                  @click="appStore.settings = !appStore.settings"
                >
                  <v-icon size="30" color="primary">mdi-cog</v-icon>
                </v-btn>
              </template>
              Settings
            </v-tooltip>
          </v-col>
        </v-row>
      </v-container>
    </v-toolbar-items>
  </v-app-bar>
</template>
