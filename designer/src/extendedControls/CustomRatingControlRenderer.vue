<template>
  <v-form>
    <v-container>
      esto esta completamente extendido
      <v-rating v-model="control.data"></v-rating>
      <!-- <v-combobox
        v-model="select"
        :items="items"
        label="Combobox"
        multiple
        outlined
        dense
      ></v-combobox> -->
    </v-container>
  </v-form>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  scopeEndsWith,
  isStringControl,
} from '@jsonforms/core';

import { defineComponent } from '@vue/composition-api';
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue2';
import { useVuetifyControl } from '@jsonforms/vue2-vuetify';
import isArray from 'lodash/isArray';
import every from 'lodash/every';
import isString from 'lodash/isString';

const controlRenderer = defineComponent({
  name: 'custom-rating-control-renderer',
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    console.log(props);
    return useVuetifyControl(
      useJsonFormsControl(props),
      (value) => value || undefined
    );
  },
  mounted() {
    console.log(this.control);
  },
  // computed: {
  //   // rating(): number[] | undefined {
  //   //   return this.control.data;
  //   // },
  // },
  data() {
    return {
      select: ['Vuetify', 'Programming'],
      items: ['Programming', 'Design', 'Vue', 'Vuetify'],
    };
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, scopeEndsWith('rating')),
};
</script>
