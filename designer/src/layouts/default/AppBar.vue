<template>
  <v-app-bar app clipped-right clipped-left flat>
    <v-btn-toggle v-model="icon" borderless>
      <v-btn value="design">
        <v-icon left> mdi-math-compass </v-icon>
        <span class="hidden-sm-and-down">Design</span>
      </v-btn>

      <v-btn value="preview">
        <v-icon left> mdi-cogs</v-icon>
        <span class="hidden-sm-and-down">Preview</span>
      </v-btn>
    </v-btn-toggle>
    <v-spacer></v-spacer>

    <v-btn-toggle v-model="icon" borderless>
      <v-btn value="calcs">
        <v-icon left> mdi-flask-outline </v-icon>
        <span class="hidden-sm-and-down">Calcs</span>
      </v-btn>

      <v-btn value="css">
        <v-icon left> mdi-language-css3</v-icon>
        <span class="hidden-sm-and-down">CSS</span>
      </v-btn>

      <v-btn value="watchers">
        <v-icon left> mdi-domino-mask </v-icon>
        <span class="hidden-sm-and-down">Watchers</span>
      </v-btn>
    </v-btn-toggle>
    <v-spacer></v-spacer>
    <v-btn-toggle v-model="icon" borderless>
      <v-btn value="left">
        <v-icon left> mdi-upload </v-icon>
      </v-btn>

      <v-btn value="right">
        <v-icon left> mdi-content-save</v-icon>
      </v-btn>
    </v-btn-toggle>
  </v-app-bar>
</template>

<script lang="ts">
import { sync } from 'vuex-pathify';
// import Settings from '@/components/Settings.vue';
// import ThemeChanger from '@/components/ThemeChanger.vue';
import { AppStore } from '../store/modules/types';

export default {
  name: 'DefaultAppBar',
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
