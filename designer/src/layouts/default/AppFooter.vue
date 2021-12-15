<template>
  <v-footer app height="75">
    <v-spacer></v-spacer>
    <!-- <v-btn-toggle v-model="icon" borderless> -->
    <!-- <v-btn value="design"> -->
    <v-switch label="Screen Validation" transparent> </v-switch>
    <!-- <span class="hidden-sm-and-down"></span> -->
    <!-- </v-btn> -->
    <v-spacer></v-spacer>
    <v-btn value="console">
      <v-icon center> mdi-chevron-double-up</v-icon>
      <span class="hidden-sm-and-down">Open Console</span>
      <v-icon center> mdi-check-circle</v-icon>
    </v-btn>
    <!-- </v-btn-toggle> -->
  </v-footer>
</template>

<script lang="ts">
import { sync } from 'vuex-pathify';
// import Settings from '@/components/Settings.vue';
// import ThemeChanger from '@/components/ThemeChanger.vue';
import { AppStore } from '../store/modules/types';

export default {
  name: 'DefaultAppFooter',
  components: {
    // ThemeChanger,
    // Settings,
  },
  computed: {
    app: sync<AppStore>('app/'),
  },
  data() {
    return {
      activeTab: 0,
      icon: null,
    };
  },
};
</script>
