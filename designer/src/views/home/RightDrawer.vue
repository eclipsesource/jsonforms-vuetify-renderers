<template>
  <v-navigation-drawer app clipped right>
    <v-list>
      <v-list-item v-for="n in 10" :key="n" link>
        <v-list-item-content>
          <v-list-item-title>Item {{ n }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
// import { sync } from 'vuex-pathify';
// import { examples } from '@/examples';

export default {
  name: 'DefaultRightDrawer',
  data() {
    return {
      //   examples,
    };
  },
  computed: {
    // drawer: sync('app/drawer'),
  },
};
</script>
