<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-hover v-slot="{ hover }">
      <v-text-field
        :step="step"
        :id="control.id + '-input'"
        :class="styles.control.input"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        :label="computedLabel"
        :hint="control.description"
        :persistent-hint="persistentHint()"
        :required="control.required"
        :error-messages="control.errors"
        :value="control.data"
        :clearable="hover"
        v-bind="vuetifyProps('v-text-field')"
        @input="onInputChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
      ></v-text-field>
    </v-hover>
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isIntegerControl,
} from '@jsonforms/core';
import { defineComponent } from 'vue';
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '../util';
import { VHover, VTextField } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'integer-control-renderer',
  components: {
    ControlWrapper,
    VHover,
    VTextField,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsControl(props),
      (value: any) => value || undefined,
      300
    );
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions;
      return options.step ?? 1;
    },
  },
  methods: {
    onInputChange(value: string): void {
      const result = parseFloat(value);
      if (
        // the number is too large, too small or NaN
        !isFinite(result) ||
        !isFinite(Number(value)) // make sure that if we have any letters inside the number this will result in invalid number - Number() parses the string with different rules than parseFloat
      ) {
        // if we can't convert successfully the value then preserve the value that is entered but AJV will mark that as invalid
        this.onChange(value);
      } else {
        this.onChange(result);
      }
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isIntegerControl),
};
</script>
