<template>
  <v-main>
    <!-- <v-fade-transition mode="out-in"> -->
    <!-- <router-view />
    </v-fade-transition> -->
    <v-container fluid>
      <!-- If using vue-router -->
      <router-view></router-view>
      <!-- hola -->
    </v-container>
  </v-main>
</template>

<script lang="ts">
export default { name: 'DefaultView' };
</script>
