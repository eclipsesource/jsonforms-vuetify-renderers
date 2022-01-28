<template>
  <div>
     <json-forms v-if="useUiSchema" 
      :renderers="editorRenderers"
      :data="data"
      :uischema="useUiSchema"
      :schema="useExportSchema"
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
    schema: {
        type: Object,
      default:() => undefined
    }
  },
  
  components: {
    JsonForms,
    EmptyEditor,
  },
  data() {
    return{

      data: {},
      useExportSchema:useExportSchema(this.schema)
     }
    
  },
  computed: {
     useUiSchema: sync('app/editor@uiSchema'),
    //  useExportSchema: function (){
    //    return useExportSchema(this.schema);
    //  }
  },
  methods:{
   
  }
};
</script>
