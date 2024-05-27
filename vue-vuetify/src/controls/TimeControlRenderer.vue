<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
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
      :model-value="inputValue"
      @update:model-value="onInputChange"
      :clearable="control.enabled"
      @click:clear="clear"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <template v-slot:prepend-inner>
        <v-menu
          v-model="showMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          :min-width="ampm && useSeconds ? '340px' : '290px'"
          v-bind="vuetifyProps('v-menu')"
          activator="parent"
          :disabled="!control.enabled"
        >
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" tabindex="-1">{{ pickerIcon }}</v-icon>
          </template>
          <v-confirm-edit
            v-model="pickerValue"
            :ok-text="okLabel"
            :cancel-text="cancelLabel"
            @cancel="() => (showMenu = false)"
            @save="() => (showMenu = false)"
          >
            <template v-slot:default="{ model: proxyModel, actions }">
              <v-time-picker
                v-if="showMenu"
                :model-value="showActions ? proxyModel.value : pickerValue"
                @update:model-value="
                  (val: string) => {
                    if (showActions) {
                      proxyModel.value = val;
                    } else {
                      pickerValue = val;
                      showMenu = false;
                    }
                  }
                "
                v-bind="vuetifyProps('v-time-picker')"
                :title="computedLabel"
                :min="minTime"
                :max="maxTime"
                :use-seconds="useSeconds"
                :format="ampm ? 'ampm' : '24hr'"
                :ampm-in-title="ampm ? true : false"
              >
                <template v-slot:actions v-if="showActions">
                  <component :is="actions"></component>
                </template>
              </v-time-picker>
            </template>
          </v-confirm-edit>
        </v-menu>
      </template>
    </v-text-field>
  </control-wrapper>
</template>

<script lang="ts">
import {
  type ControlElement,
  isTimeControl,
  type JsonFormsRendererRegistryEntry,
  type JsonSchema,
  rankWith,
} from '@jsonforms/core';
import { defineComponent, ref } from 'vue';
import {
  rendererProps,
  type RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue';
import {
  VBtn,
  VHover,
  VIcon,
  VMenu,
  VSpacer,
  VTextField,
  VConfirmEdit,
} from 'vuetify/components';
import { VTimePicker } from 'vuetify/labs/VTimePicker';

import { parseDateTime, useTranslator, useVuetifyControl } from '../util';
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
    VConfirmEdit,
  },
  directives: { DisabledIconFocus },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const t = useTranslator();

    const showMenu = ref(false);
    const mask = ref<((value: string) => (string | RegExp)[]) | undefined>(
      undefined,
    );

    const adaptValue = (value: any) => value || undefined;
    const control = useVuetifyControl(useJsonFormsControl(props), adaptValue);
    return { ...control, showMenu, mask, t, adaptValue };
  },
  computed: {
    pickerIcon(): string {
      return typeof this.appliedOptions.pickerIcon == 'string'
        ? this.appliedOptions.pickerIcon
        : 'mdi-clock-outline';
    },
    timeFormat(): string {
      return typeof this.appliedOptions.timeFormat == 'string'
        ? this.appliedOptions.timeFormat
        : this.ampm
          ? 'hh:mm a'
          : 'HH:mm';
    },
    timeSaveFormat(): string {
      return typeof this.appliedOptions.timeSaveFormat == 'string'
        ? this.appliedOptions.timeSaveFormat
        : 'HH:mm:ssZ';
    },
    formats(): string[] {
      return [
        this.timeSaveFormat,
        this.timeFormat,
        ...JSON_SCHEMA_TIME_FORMATS,
      ];
    },
    useSeconds(): boolean {
      return this.timeFormat.includes('s') ? true : false;
    },
    ampm(): boolean {
      return this.appliedOptions.ampm === true;
    },
    minTime(): string | undefined {
      if (typeof this.vuetifyProps('v-time-picker').min === 'string') {
        // prefer the vuetify option first
        return this.vuetifyProps('v-time-picker').min;
      }

      // provide min so that the browser can display the native component with only selections that are allowed.
      // Since the browser supports only min there is posibility for the user to select a date that is defined in the formatExclusiveMinimum but the ajv will catch that validation.
      const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
      if (typeof schema.formatMinimum === 'string') {
        // convert to what VTimePicker expects
        const time = parseDateTime(schema.formatMinimum, this.formats);
        return time
          ? this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm')
          : schema.formatMinimum;
      } else if (typeof schema.formatExclusiveMinimum === 'string') {
        // convert to what VTimePicker expects
        let time = parseDateTime(schema.formatExclusiveMinimum, this.formats);
        if (time) {
          time = this.useSeconds
            ? time.add(1, 'second')
            : time.add(1, 'minute');
        }
        return time
          ? this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm')
          : schema.formatExclusiveMinimum;
      }
      return undefined;
    },
    maxTime(): string | undefined {
      if (typeof this.vuetifyProps('v-time-picker').max === 'string') {
        // prefer the vuetify option first
        return this.vuetifyProps('v-time-picker').max;
      }

      // provide max so that the browser can display the native component with only selections that are allowed.
      // Since the browser supports only max there is posibility for the user to select a date that is defined in the formatExclusiveMaximum but the ajv will catch that validation.
      const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
      if (typeof schema.formatMaximum === 'string') {
        // convert to what VTimePicker expects
        const time = parseDateTime(schema.formatMaximum, this.formats);
        return time
          ? this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm')
          : schema.formatMaximum;
      } else if (typeof schema.formatExclusiveMaximum === 'string') {
        // convert to what VTimePicker expects
        let time = parseDateTime(schema.formatExclusiveMaximum, this.formats);
        if (time) {
          time = this.useSeconds
            ? time.subtract(1, 'second')
            : time.subtract(1, 'minute');
        }
        return time
          ? this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm')
          : schema.formatExclusiveMaximum;
      }
      return undefined;
    },
    inputValue(): string | undefined {
      const value = this.control.data;
      const time = parseDateTime(value, this.formats);
      return time ? time.format(this.timeFormat) : value;
    },
    pickerValue: {
      get(): string | undefined {
        const value = this.control.data;

        const time = parseDateTime(value, this.formats);
        // show only valid values
        return time
          ? this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm')
          : undefined;
      },
      set(val: string) {
        this.onPickerChange(val);
      },
    },
    clearLabel(): string {
      const label =
        typeof this.appliedOptions.clearLabel == 'string'
          ? this.appliedOptions.clearLabel
          : 'Clear';

      return this.t(label, label);
    },
    cancelLabel(): string {
      const label =
        typeof this.appliedOptions.cancelLabel == 'string'
          ? this.appliedOptions.cancelLabel
          : 'Cancel';

      return this.t(label, label);
    },
    okLabel(): string {
      const label =
        typeof this.appliedOptions.okLabel == 'string'
          ? this.appliedOptions.okLabel
          : 'OK';
      return this.t(label, label);
    },
    showActions(): boolean {
      return this.appliedOptions.showActions === true;
    },
  },
  methods: {
    onInputChange(value: string): void {
      const time = parseDateTime(value, this.timeFormat);
      const newdata = time ? time.format(this.timeSaveFormat) : value;
      if (this.adaptValue(newdata) !== this.control.data) {
        this.onChange(newdata);
      }
    },
    onPickerChange(value: string): void {
      const time = parseDateTime(value, this.useSeconds ? 'HH:mm:ss' : 'HH:mm');
      this.onChange(time ? time.format(this.timeSaveFormat) : value);
    },
    clear(): void {
      this.onChange(null);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isTimeControl),
};
</script>
