<template>
  <v-checkbox
    :input-value="control.data ? control.data : null"
    :label="control.label"
    :error-messages="control.errors"
    clearable
    @change="onChange"
  >
  </v-checkbox>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isBooleanControl,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';
import { VCheckbox } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'control-renderer',
  components: {
    VCheckbox,
  },
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    const p = useJsonFormsControl(props);
    console.log(p);
    return p;
  },
  methods: {
    // TODO: how to handle unchecked (false/null) value from a checkbox
    onChange(newValue: boolean) {
      newValue = newValue || false;
      this.handleChange(this.control.path, newValue ?? undefined);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isBooleanControl),
};
</script>
