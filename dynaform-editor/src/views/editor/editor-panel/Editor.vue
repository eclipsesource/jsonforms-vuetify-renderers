<template>
  <div>
     <json-forms v-if="useUiSchema" 
      :renderers="editorRenderers"
      :data="data"
      :uischema="useUiSchema"
      :schema="schema"
    />
    <EmptyEditor v-else/>
  </div>
</template>

<script lang="ts">
import { JsonForms, JsonFormsChangeEvent } from '@jsonforms/vue2';
import { PropType } from 'vue';
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import EmptyEditor from './EmptyEditor.vue';
import { sync } from 'vuex-pathify';
export default {
  name: 'Editor',
  props: {
    editorRenderers: {
      required: false,
      type: Array as PropType<JsonFormsRendererRegistryEntry[]>,
    },
  },
  
  components: {
    JsonForms,
    EmptyEditor,
  },
  mounted() {
    console.log(this.editorRenderers);
  },
  data() {
    return{

      data: {},
      schema:{}
    }
  },
  computed: {
     useUiSchema: sync('app/editor@uiSchema'),
  },
};
</script>
