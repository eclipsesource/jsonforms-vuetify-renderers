<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-hover v-slot="{ isHovering }">
      <v-text-field
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
        v-bind="vuetifyProps('v-text-field')"
        @focus="isFocused = true"
        @blur="isFocused = false"
        v-model="maskModel"
        v-maska:[options]="boundObject"
      />
    </v-hover>
  </control-wrapper>
</template>

<script lang="ts">
import {
  and,
  ControlElement,
  isStringControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  Tester,
  UISchemaElement,
} from '@jsonforms/core';
import {
  rendererProps,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue';
import isEmpty from 'lodash/isEmpty';
import { defineComponent } from 'vue';
import { VHover, VTextField } from 'vuetify/components';
import { useVuetifyControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';
import { MaskTokens, MaskOptions, vMaska } from 'maska';
import { cloneDeep } from 'lodash';
import { ref } from 'vue';

const defaultTokens: MaskTokens = {
  '#': { pattern: /[0-9]/ },
  '@': { pattern: /[a-zA-Z]/ },
  '*': { pattern: /[a-zA-Z0-9]/ },
};

const controlRenderer = defineComponent({
  name: 'string-mask-control-renderer',
  components: {
    ControlWrapper,
    VHover,
    VTextField,
  },
  directives: {
    DisabledIconFocus,
    maska: vMaska,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const adaptValue = (value: any) => value || undefined;
    const control = useVuetifyControl(useJsonFormsControl(props), adaptValue);
    const boundObject = ref({
      masked: '',
      unmasked: '',
      completed: false,
    });
    return { ...control, adaptValue, boundObject };
  },
  computed: {
    maskModel: {
      get(): string | undefined {
        return this.control.data;
      },
      set(val: string | undefined): void {
        let value = this.returnMaskedValue ? val : this.boundObject.unmasked;

        if (this.adaptValue(value) !== this.control.data) {
          // only invoke onChange when values are different since v-mask is also listening on input which lead to loop

          this.onChange(value);
        }
      },
    },
    options(): MaskOptions {
      return {
        mask: this.appliedOptions.mask,
        tokens: this.tokens,
        tokensReplace: true,
      };
    },
    tokens(): MaskTokens {
      let tokens: MaskTokens | undefined = undefined;

      if (this.appliedOptions.maskReplacers) {
        tokens = this.toTokens(this.appliedOptions.maskReplacers);
      }
      if (this.appliedOptions.tokens) {
        tokens = this.toTokens(this.appliedOptions.tokens);
      }

      if (!tokens) {
        tokens = defaultTokens;
      }

      return tokens;
    },
    returnMaskedValue(): boolean {
      return this.appliedOptions.returnMaskedValue === true;
    },
  },
  methods: {
    toTokens(tokenParams: Record<string, any>): MaskTokens {
      let tokens = cloneDeep(defaultTokens);
      if (tokenParams) {
        for (let key in tokenParams) {
          let value = tokenParams[key];

          if (value) {
            if (typeof value === 'string') {
              tokens[key] = {
                pattern: new RegExp(value),
              };
            } else {
              tokens[key] = {
                ...value,
                pattern: new RegExp(value.pattern),
              };
            }
          } else {
            delete tokens[key];
          }
        }
      }
      return tokens;
    },
  },
});

export default controlRenderer;

const hasOption =
  (optionName: string): Tester =>
  (uischema: UISchemaElement): boolean => {
    if (isEmpty(uischema)) {
      return false;
    }

    const options = uischema.options;
    return (
      (options &&
        !isEmpty(options) &&
        typeof options[optionName] === 'string') ||
      false
    );
  };

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, and(isStringControl, hasOption('mask'))),
};
</script>
