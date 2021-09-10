<template>
  <v-text-field
    :value="control.data ? control.data : null"
    :label="control.label"
    :error-messages="control.errors"
    clearable
    @input="onChange"
    type="number"
  >
  </v-text-field>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isIntegerControl,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';
import { VTextField } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'integer-control-renderer',
  components: {
    VTextField,
  },
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useJsonFormsControl(props);
  },
  methods: {
    onChange(newValue: string) {
      this.handleChange(this.control.path, parseInt(newValue, 10) ?? undefined);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isIntegerControl),
};
</script>
