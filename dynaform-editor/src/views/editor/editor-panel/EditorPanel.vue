<template>
  <v-container>
    <v-tabs>
      <v-tabs-slider></v-tabs-slider>
      <v-tab class="primary--text"> Editor </v-tab>
      <v-tab v-for="(item, index) in editorTabs" :key="'tab' + index"> </v-tab>

      <v-tab-item>
        <Editor :editorRenderers="editorRenderers" :schema="schema" />
      </v-tab-item>
      <v-tab-item v-for="(item, index) in editorTabs" :key="'content' + index">
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import Editor from './Editor.vue';
export default {
  name: 'EditorPanel',
  components: {
    Editor,
  },
  props: {
    editorTabs: {
      required: false,
      type: Array,
      default: () => [],
    },
    editorRenderers: {
      required: false,
      type: Array,
      default: () => [],
    },
    schema:{
      type: Object,
      default:() => undefined
    }
  },
  methods: {
    log: function (evt) {
      window.console.log(evt);
    },
    updateConfig: function (items) {
      alert('upadete config');
    },
  },
};
</script>
