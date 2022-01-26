<template>
  <v-app>
    <default-app-bar />
    <default-view />
  </v-app>
</template>

<script lang="ts">
export default {
  name: 'DefaultLayout',

  components: {
    DefaultAppBar: () => import('./AppBar'),
    DefaultView: () => import('./View'),
  },
};
</script>
