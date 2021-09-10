<template>
  <v-date-picker
    :value="control.data ? control.data : null"
    :label="control.label"
    :error-messages="control.errors"
    clearable
    @input="onChange"
  >
  </v-date-picker>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isDateControl,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';
import { VDatePicker } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'integer-control-renderer',
  components: {
    VDatePicker,
  },
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useJsonFormsControl(props);
  },
  methods: {
    onChange(newValue: string) {
      this.handleChange(this.control.path, newValue ?? undefined);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isDateControl),
};
</script>
