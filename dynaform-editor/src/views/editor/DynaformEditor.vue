<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col cols="3">
        <PalletePanel :schema="editorSchema"/>
      </v-col>
      <v-col cols="6">
        <EditorPanel
          :editorTabs="editorTabs"
          :editorRenderers="editorRenderers"
          :schema="editorSchema"
        />
      </v-col>
      <v-col cols="3">
        <PropertiesPanel />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import PalletePanel from './pallete-panel';
import EditorPanel from './editor-panel';
import PropertiesPanel from './properties-panel';
import { defaultEditorRenderers } from '../../renderers';
import { ExampleSchemaService } from '../../api/exampleSchemaService';
import { sync } from 'vuex-pathify';
export default {
  name: 'EditorView',
  components: {
    PalletePanel,
    EditorPanel,
    PropertiesPanel,
  },
  data() {
    return {
      editorTabs: [],
      editorRenderers: defaultEditorRenderers,
      schemaService: new ExampleSchemaService(),
    };

  },
  mounted(){
    this.schemaService
      .getSchema()
      .then((schema) => this.$store.set('app/editor@schema', schema));
  },

 computed: {
    editorSchema: sync('app/editor@schema'),
  },
};
</script>
