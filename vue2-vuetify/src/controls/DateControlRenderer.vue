<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on: onMenu }">
        <v-hover v-slot="{ hover }">
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
            v-bind="vuetifyProps('v-text-field')"
            v-mask="mask"
            v-on="onMenu"
            :value="inputValue"
            @change="onInputChange"
            @focus="isFocused = true"
            @blur="isFocused = false"
          >
            <template slot="append">
              <v-icon v-if="hover" @click="clear">mdi-close</v-icon>
            </template>
          </v-text-field>
        </v-hover>
      </template>
      <v-date-picker
        v-if="showMenu"
        :value="pickerValue"
        ref="picker"
        v-bind="vuetifyProps('v-date-picker')"
        :min="minDate"
        :max="maxDate"
        :type="pickerType"
      >
        <v-btn text color="primary" @click="clear"> {{ clearLabel }} </v-btn>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="showMenu = false">
          {{ cancelLabel }}
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="
            () => {
              onPickerChange($refs.picker.inputDate);
              showMenu = false;
            }
          "
        >
          {{ okLabel }}
        </v-btn>
      </v-date-picker>
    </v-menu>
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  isDateControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
} from '@jsonforms/core';
import { VueMaskDirective as Mask } from 'v-mask';
import { defineComponent } from '../vue';

import {
  rendererProps,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { ref } from '@vue/composition-api';
import dayjs from 'dayjs';
import {
  VBtn,
  VDatePicker,
  VHover,
  VIcon,
  VMenu,
  VSpacer,
  VTextField,
} from 'vuetify/lib';
import { parseDateTime, useTranslator, useVuetifyControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';

const JSON_SCHEMA_DATE_FORMATS = ['YYYY-MM-DD'];

// https://ajv.js.org/packages/ajv-formats.html#keywords-to-compare-values-formatmaximum-formatminimum-and-formatexclusivemaximum-formatexclusiveminimum
type AjvMinMaxFormat = {
  formatMinimum?: string | { $data: any };
  formatExclusiveMinimum?: string | { $data: any };
  formatMaximum?: string | { $data: any };
  formatExclusiveMaximum?: string | { $data: any };
};

const controlRenderer = defineComponent({
  name: 'date-control-renderer',
  components: {
    ControlWrapper,
    VHover,
    VTextField,
    VMenu,
    VDatePicker,
    VIcon,
    VSpacer,
    VBtn,
  },
  directives: { DisabledIconFocus, Mask },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const t = useTranslator();

    const showMenu = ref(false);
    const mask = ref<((value: string) => (string | RegExp)[]) | undefined>(
      undefined
    );

    const control = useVuetifyControl(
      useJsonFormsControl(props),
      (value) => value || undefined
    );
    return { ...control, showMenu, mask, t };
  },
  watch: {
    isFocused(newFocus) {
      if (newFocus) {
        this.mask = this.maskFunction;
      } else {
        this.mask = undefined;
      }
    },
  },
  computed: {
    dateFormat(): string {
      return typeof this.appliedOptions.dateFormat == 'string'
        ? this.appliedOptions.dateFormat
        : 'YYYY-MM-DD';
    },
    dateSaveFormat(): string {
      return typeof this.appliedOptions.dateSaveFormat == 'string'
        ? this.appliedOptions.dateSaveFormat
        : 'YYYY-MM-DD';
    },
    formats(): string[] {
      return [
        this.dateSaveFormat,
        this.dateFormat,
        ...JSON_SCHEMA_DATE_FORMATS,
      ];
    },
    pickerType(): string {
      if (!this.dateFormat.includes('D')) {
        return 'month';
      }
      return 'date';
    },
    minDate(): string | undefined {
      if (typeof this.vuetifyProps('v-date-picker').min === 'string') {
        // prefer the vuetify option first
        return this.vuetifyProps('v-date-picker').min;
      }
      // provide min so that the browser can display the native component with only selections that are allowed.
      // Since the browser supports only min there is posibility for the user to select a date that is defined in the formatExclusiveMinimum but the ajv will catch that validation.
      const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
      if (typeof schema.formatMinimum === 'string') {
        return schema.formatMinimum;
      } else if (typeof schema.formatExclusiveMinimum === 'string') {
        return schema.formatExclusiveMinimum;
      }
      return undefined;
    },
    maxDate(): string | undefined {
      if (typeof this.vuetifyProps('v-date-picker').max === 'string') {
        // prefer the vuetify option first
        return this.vuetifyProps('v-date-picker').max;
      }
      // provide max so that the browser can display the native component with only selections that are allowed.
      // Since the browser supports only max there is posibility for the user to select a date that is defined in the formatExclusiveMaximum but the ajv will catch that validation.
      const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
      if (typeof schema.formatMaximum === 'string') {
        return schema.formatMaximum;
      } else if (typeof schema.formatExclusiveMaximum === 'string') {
        return schema.formatExclusiveMaximum;
      }
      return undefined;
    },
    inputValue(): string | undefined {
      const value = this.control.data;
      const date = parseDateTime(value, this.formats);
      return date ? date.format(this.dateFormat) : value;
    },
    pickerValue(): string | undefined {
      const value = this.control.data;

      const date = parseDateTime(value, this.formats);
      return date ? date.format('YYYY-MM-DD') : value;
    },
    clearLabel(): string {
      const label =
        typeof this.appliedOptions.clearLabel == 'string'
          ? this.appliedOptions.clearLabel
          : 'Clear';

      return label;
    },
    cancelLabel(): string {
      const label =
        typeof this.appliedOptions.cancelLabel == 'string'
          ? this.appliedOptions.cancelLabel
          : 'Cancel';

      return label;
    },
    okLabel(): string {
      const label =
        typeof this.appliedOptions.okLabel == 'string'
          ? this.appliedOptions.okLabel
          : 'OK';
      return label;
    },
  },
  methods: {
    onInputChange(value: string): void {
      const date = parseDateTime(value, this.dateFormat);
      this.onChange(date ? date.format(this.dateSaveFormat) : value);
    },
    onPickerChange(value: string): void {
      const date = parseDateTime(value, 'YYYY-MM-DD');
      this.onChange(date ? date.format(this.dateSaveFormat) : value);
    },
    clear(): void {
      this.mask = undefined;
      this.onChange(null);
    },
    maskFunction(value: string): (string | RegExp)[] {
      const format = this.dateFormat;

      const parts = format.split(/([^YMD]*)(YYYY|YY|MMMM|MMM|MM|M|DD|D)/);

      let index = -1;
      const numbers = value?.replace(/[^0-9]/g, '');

      let result: (string | RegExp)[] = [];
      for (const part of parts) {
        if (part && part !== '') {
          if (part == 'YYYY') {
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            index += 4;
          } else if (part == 'YY') {
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            index += 2;
          } else if (part == 'M') {
            result.push(/[1]/);
            result.push(/[0-2]/);
            index += 2;
          } else if (part == 'MM') {
            result.push(/[0-1]/);
            index += 1;
            result.push(numbers.charAt(index) === '0' ? /[1-9]/ : /[0-2]/);
            index += 1;
          } else if (part == 'MMM') {
            let regex = '(';
            for (let i = 0; i <= 11; i++) {
              regex += dayjs().month(0).format('MMM');
              if (i < 11) {
                regex += '|';
              }
            }
            regex += ')';
            result.push(new RegExp(regex));
          } else if (part == 'MMMM') {
            let regex = '(';
            for (let i = 0; i <= 11; i++) {
              regex += dayjs().month(0).format('MMMM');
              if (i < 11) {
                regex += '|';
              }
            }
            regex += ')';
            result.push(new RegExp(regex));
          } else if (part == 'D') {
            result.push(/[1-3]/);
            index += 1;
            result.push(numbers.charAt(index) === '3' ? /[0-1]/ : /[0-9]/);
            index += 1;
          } else if (part == 'DD') {
            result.push(/[0-3]/);
            index += 1;
            result.push(
              numbers.charAt(index) === '3'
                ? /[0-1]/
                : numbers.charAt(index) === '0'
                ? /[1-9]/
                : /[0-9]/
            );
            index += 1;
          } else {
            result.push(part);
          }
        }
      }

      return result;
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isDateControl),
};
</script>
