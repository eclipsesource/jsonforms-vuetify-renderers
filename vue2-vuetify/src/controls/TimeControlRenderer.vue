<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-menu
      ref="menu"
      v-model="showMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on: onMenu }">
        <v-hover v-slot="{ hover }">
          <v-text-field
            disabled-icon-focus
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
      <v-time-picker
        v-if="showMenu"
        :value="pickerValue"
        ref="picker"
        v-bind="vuetifyProps('v-time-picker')"
        :min="min"
        :max="max"
        :use-seconds="useSeconds"
        :format="ampm ? 'ampm' : '24hr'"
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
              onPickerChange($refs.picker.genValue());
              showMenu = false;
            }
          "
        >
          {{ okLabel }}
        </v-btn></v-time-picker
      >
    </v-menu>
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  isTimeControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
} from '@jsonforms/core';
import {
  rendererProps,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { computed, ComputedRef, ref, unref } from '@vue/composition-api';
import { VueMaskDirective as Mask } from 'v-mask';
import {
  VBtn,
  VHover,
  VIcon,
  VMenu,
  VSpacer,
  VTextField,
  VTimePicker,
} from 'vuetify/lib';
import { parseDateTime, useTranslator, useVuetifyControl } from '../util';
import { defineComponent } from '../vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';

const JSON_SCHEMA_TIME_FORMATS = [
  'HH:mm:ss.SSSZ',
  'HH:mm:ss.SSS',
  'HH:mm:ssZ',
  'HH:mm:ss',
];

// https://ajv.js.org/packages/ajv-formats.html#keywords-to-compare-values-formatmaximum-formatminimum-and-formatexclusivemaximum-formatexclusiveminimum
type AjvMinMaxFormat = {
  formatMinimum?: string | { $data: any };
  formatExclusiveMinimum?: string | { $data: any };
  formatMaximum?: string | { $data: any };
  formatExclusiveMaximum?: string | { $data: any };
};

const controlRenderer = defineComponent({
  name: 'time-control-renderer',
  components: {
    ControlWrapper,
    VHover,
    VTextField,
    VMenu,
    VTimePicker,
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
    const wrapper = useVuetifyControl(
      useJsonFormsControl(props),
      (value: any) => value || undefined
    );

    const ampm = computed(() => wrapper.appliedOptions.value.ampm === true);

    const timeFormat: ComputedRef<string> = computed(() =>
      typeof wrapper.appliedOptions.value.timeFormat == 'string'
        ? wrapper.appliedOptions.value.timeFormat
        : ampm.value
        ? 'hh:mm a'
        : 'HH:mm'
    );

    const timeSaveFormat: ComputedRef<string> = computed(() =>
      typeof wrapper.appliedOptions.value.timeSaveFormat == 'string'
        ? wrapper.appliedOptions.value.timeSaveFormat
        : 'HH:mm:ss'
    );

    const formats: ComputedRef<string[]> = computed(() => [
      timeSaveFormat.value,
      timeFormat.value,
      ...JSON_SCHEMA_TIME_FORMATS,
    ]);

    const useSeconds: ComputedRef<boolean> = computed(() =>
      timeFormat.value.includes('s') ? true : false
    );

    const min: ComputedRef<string | undefined> = computed(() => {
      const schema = unref(wrapper.control).schema as JsonSchema &
        AjvMinMaxFormat;
      if (typeof schema.formatMinimum === 'string') {
        return schema.formatMinimum;
      } else if (typeof schema.formatExclusiveMinimum === 'string') {
        return schema.formatExclusiveMinimum;
      }
      return undefined;
    });

    const max: ComputedRef<string | undefined> = computed(() => {
      const schema = unref(wrapper.control).schema as JsonSchema &
        AjvMinMaxFormat;

      if (typeof schema.formatMaximum === 'string') {
        return schema.formatMaximum;
      } else if (typeof schema.formatExclusiveMaximum === 'string') {
        return schema.formatExclusiveMaximum;
      }
      return undefined;
    });

    const maskFunction = (value: string) => {
      const format = timeFormat.value;
      const parts = format.split(/([^HhmsAaSZ]*)(hh?|HH?|mm?|ss?|a|A|SSS|Z)/);

      let index = -1;
      const numbers = value?.replace(/[^0-9]/g, '');

      let result: (string | RegExp)[] = [];
      for (const part of parts) {
        if (part && part !== '') {
          if (part == 'H') {
            result.push(/[0-9]/);
            index += 1;
            if (numbers.charAt(index) === '1') {
              result.push(/[0-9]/);
              index += 1;
            } else if (numbers.charAt(index) === '2') {
              result.push(/[0-3]/);
              index += 1;
            }
          } else if (part == 'HH') {
            result.push(/[0-2]/);
            index += 1;
            result.push(numbers.charAt(index) === '2' ? /[0-3]/ : /[0-9]/);
            index += 1;
          } else if (part == 'h') {
            result.push(/[1]/);
            result.push(/[0-2]/);
            index += 2;
          } else if (part == 'hh') {
            result.push(/[0-1]/);
            index += 1;
            result.push(numbers.charAt(index) === '0' ? /[1-9]/ : /[0-2]/);
            index += 1;
          } else if (part == 'm') {
            result.push(/[0-9]/);
            index += 1;
            if (
              numbers.charAt(index) === '1' ||
              numbers.charAt(index) === '2' ||
              numbers.charAt(index) === '3' ||
              numbers.charAt(index) === '4' ||
              numbers.charAt(index) === '5'
            ) {
              result.push(/[0-9]/);
              index += 1;
            }
          } else if (part == 'mm') {
            result.push(/[0-5]/);
            result.push(/[0-9]/);
            index += 2;
          } else if (part == 's') {
            result.push(/[0-9]/);
            index += 1;
            if (
              numbers.charAt(index) === '1' ||
              numbers.charAt(index) === '2' ||
              numbers.charAt(index) === '3' ||
              numbers.charAt(index) === '4' ||
              numbers.charAt(index) === '5'
            ) {
              result.push(/[0-9]/);
              index += 1;
            }
          } else if (part == 'ss') {
            result.push(/[0-5]/);
            result.push(/[0-9]/);
            index += 2;
          } else if (part == 'a') {
            result.push(/a|p/);
            result.push('m');
          } else if (part == 'A') {
            result.push(/A|P/);
            result.push('M');
          } else if (part == 'Z') {
            //GMT-12 to GMT+14
            result.push(/\+|-/);
            result.push(/[0-1]/);
            index += 1;
            if (value.includes('-0') || value.includes('+0')) {
              result.push(/[0-9]/);
              index += 1;
            } else if (value.includes('-1') || value.includes('+1')) {
              result.push(value.includes('+1') ? /[0-4]/ : /[0-2]/);
              index += 1;
            }
            result.push(':');
            result.push(/[0-5]/);
            result.push(/[0-9]/);
            index += 2;
          } else if (part == 'SSS') {
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            result.push(/[0-9]/);
            index += 3;
          } else {
            result.push(part);
          }
        }
      }

      return result;
    };

    const mask = ref<((value: string) => (string | RegExp)[]) | undefined>(
      undefined
    );

    const inputValue: ComputedRef<string | undefined> = computed(() => {
      const value = unref(wrapper.control).data as string | undefined;
      const time = parseDateTime(value, formats.value);
      return time ? time.format(timeFormat.value) : value;
    });

    const onInputChange = (value: any) => {
      const time = parseDateTime(value, timeFormat.value);
      wrapper.onChange(time ? time.format(timeSaveFormat.value) : value);
    };

    const pickerValue: ComputedRef<string | undefined> = computed(() => {
      const value = unref(wrapper.control).data as string | undefined;
      const time = parseDateTime(value, formats.value);
      return time
        ? useSeconds.value
          ? time.format('HH:mm:ss')
          : time.format('HH:mm')
        : value;
    });

    const onPickerChange = (value: any) => {
      const time = parseDateTime(
        value,
        useSeconds.value ? 'HH:mm:ss' : 'HH:mm'
      );
      wrapper.onChange(time ? time.format(timeSaveFormat.value) : value);
    };

    const clear = () => {
      mask.value = undefined;
      wrapper.onChange(null);
    };

    const clearLabel: ComputedRef<string> = computed(() => {
      const label =
        typeof wrapper.appliedOptions.value.clearLabel == 'string'
          ? wrapper.appliedOptions.value.clearLabel
          : 'Clear';
      return t.value(label, label);
    });

    const cancelLabel: ComputedRef<string> = computed(() => {
      const label =
        typeof wrapper.appliedOptions.value.cancelLabel == 'string'
          ? wrapper.appliedOptions.value.cancelLabel
          : 'Cancel';

      return t.value(label, label);
    });

    const okLabel: ComputedRef<string> = computed(() => {
      const label =
        typeof wrapper.appliedOptions.value.okLabel == 'string'
          ? wrapper.appliedOptions.value.okLabel
          : 'OK';

      return t.value(label, label);
    });

    return {
      ...wrapper,
      showMenu,
      ampm,
      timeFormat,
      timeSaveFormat,
      useSeconds,
      formats,
      min,
      max,
      mask,
      maskFunction,
      inputValue,
      pickerValue,
      clear,
      onInputChange,
      onPickerChange,
      clearLabel,
      cancelLabel,
      okLabel,
    };
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
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isTimeControl),
};
</script>
