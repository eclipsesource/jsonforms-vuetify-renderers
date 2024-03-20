<template>
  <p class="text-blue">live3</p>
  <p>{{touched}}</p>
  <p>{{filteredErrors}}</p>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-hover v-slot="{ isHovering }">
      <v-combobox
        v-if="suggestions !== undefined"
        v-disabled-icon-focus
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
        :maxlength="
          appliedOptions.restrict ? control.schema.maxLength : undefined
        "
        :counter="
          control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
        :clearable="isHovering"
        :model-value="control.data"
        :items="suggestions"
        hide-no-data
        v-bind="vuetifyProps('v-combobox')"
        @update:model-value="onChange"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      <v-text-field
        v-else
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
        :model-value="control.data"
        :maxlength="
          appliedOptions.restrict ? control.schema.maxLength : undefined
        "
        :counter="
          control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
        :clearable="isHovering"
        v-bind="vuetifyProps('v-text-field')"
        @update:model-value="onChange"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
    </v-hover>
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl,
} from '@jsonforms/core';
import {defineComponent} from 'vue';
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '../util';
import { VHover, VTextField, VCombobox } from 'vuetify/components';
import { DisabledIconFocus } from './directives';
import isArray from 'lodash/isArray';
import every from 'lodash/every';
import isString from 'lodash/isString';
import { useBlurHandler } from "../util";

const controlRenderer = defineComponent({
  name: 'string-control-renderer',
  components: {
    ControlWrapper,
    VHover,
    VTextField,
    VCombobox,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const vControl = useVuetifyControl(
      useJsonFormsControl(props),
      (value) => value || undefined,
      300
    );

    const { handleBlur } = useBlurHandler(vControl);

    return {
      ...vControl,
      handleBlur
    }
  },
  computed: {
    suggestions(): string[] | undefined {
      const suggestions = this.control.uischema.options?.suggestion;

      if (
        suggestions === undefined ||
        !isArray(suggestions) ||
        !every(suggestions, isString)
      ) {
        // check for incorrect data
        return undefined;
      }
      return suggestions;
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isStringControl),
};
</script>
