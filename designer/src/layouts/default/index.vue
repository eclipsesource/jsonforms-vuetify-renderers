<template>
  <v-app id="inspire">
    <DefaultAppBar />
    <DefaultView />
    <DefaultAppFooter />
  </v-app>
</template>

<script lang="ts">
export default {
  name: 'DefaultLayout',

  components: {
    DefaultAppBar: () => import('./AppBar'),
    DefaultView: () => import('./View'),
    DefaultAppFooter: () => import('./AppFooter'),
  },
  data: () => ({ drawer: null }),
};
</script>
