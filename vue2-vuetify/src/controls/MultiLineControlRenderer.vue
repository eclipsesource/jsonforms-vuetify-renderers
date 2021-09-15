<template>
  <v-textarea
    :value="control.data ? control.data : null"
    :label="control.label"
    :error-messages="control.errors"
    clearable
    @input="onChange"
  >
  </v-textarea>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isMultiLineControl,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';
import { VTextarea } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'multi-line-control-renderer',
  components: {
    VTextarea,
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
  tester: rankWith(2, isMultiLineControl),
};
</script>
