<template>
  <v-container fluid>
    <DefaultLeftDrawer />
    <DefaultRightDrawer />
    <HomeView />
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'DefaultHome',

  components: {
    DefaultLeftDrawer: () => import('./LeftDrawer'),
    DefaultRightDrawer: () => import('./RightDrawer'),
    HomeView: () => import('./Home'),
  },
  data: () => ({ drawer: null }),
};
</script>
