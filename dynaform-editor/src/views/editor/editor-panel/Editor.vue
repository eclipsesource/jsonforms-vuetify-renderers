<template>
  <div>
     <json-forms v-if="useUiSchema" 
      :renderers="editorRenderers"
      :data="data"
      :uischema="useUiSchema"
      :schema="useExportSchema()"
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
import {useExportSchema} from '../../../util'
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
  data() {
    return{

      data: {},
      schema:{}
    }
  },
  
  computed: {
    
     useUiSchema: sync('app/editor@uiSchema'),
     useSchema: sync('app/editor@schema'),
  },
  methods:{
    useExportSchema: function(){
      return useExportSchema();
    }
  }
};
</script>
