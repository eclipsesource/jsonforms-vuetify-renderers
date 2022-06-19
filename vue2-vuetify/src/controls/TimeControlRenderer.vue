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
      :return-value.sync="timeModel"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
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
            :value="timeFormatted"
            :clearable="hover"
            v-bind="vuetifyProps('v-text-field')"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @input="onChange"
            v-on="on"
          ></v-text-field>
        </v-hover>
      </template>
      <v-time-picker
        v-if="showMenu"
        v-model="timeModel"
        v-bind="vuetifyProps('v-time-picker')"
        :min="min"
        :max="max"
        :use-seconds="useSeconds"
        :format="ampm ? 'ampm' : '24hr'"
        @click:minute="clickMinute"
        @click:second="clickSecond"
      ></v-time-picker>
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
import {
  computed,
  ComputedRef,
  ref,
  unref,
  WritableComputedRef,
} from '@vue/composition-api';
import { VHover, VMenu, VTextField, VTimePicker } from 'vuetify/lib';
import { parseDateTime, useVuetifyControl } from '../util';
import { defineComponent } from '../vue';
import { default as ControlWrapper } from './ControlWrapper.vue';

const JSON_SCHEMA_TIME_FORMATS = [
  'HH:mm:ss.SSSZ',
  'HH:mm:ss.SSS',
  'HH:mm:ss',
  'HH:mm',
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
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const showMenu = ref(false);
    const wrapper = useVuetifyControl(
      useJsonFormsControl(props),
      (value: any) => toSaveTimeFormat(value) || undefined
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

    const toSaveTimeFormat = (value: any) => {
      const time = parseDateTime(value, formats.value);
      return time ? time.format(timeSaveFormat.value) : value;
    };

    const useSeconds: ComputedRef<boolean> = computed(() =>
      timeFormat.value.includes('s') ? true : false
    );

    const timeModel: WritableComputedRef<string | undefined> = computed({
      get() {
        let result: string | undefined = undefined;

        const time = parseDateTime(unref(wrapper.control).data, formats.value);
        if (time) {
          let timePickerFormat = 'HH:mm';
          if (useSeconds.value) {
            timePickerFormat += ':ss';
          }
          // Time picker model (ISO 8601 format, 24hr hh:mm)
          result = time.format(timePickerFormat);
        }

        return result;
      },
      set(value: string | undefined): void {
        // convert handled by toSaveTimeFormat
        wrapper.onChange(value);
      },
    });

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

    const timeFormatted: ComputedRef<string | undefined> = computed(() => {
      const value = unref(wrapper.control).data as string | undefined;
      const time = parseDateTime(value, formats.value);
      return time ? time.format(timeFormat.value) : value;
    });

    return {
      ...wrapper,
      showMenu,
      ampm,
      timeFormat,
      timeSaveFormat,
      useSeconds,
      formats,
      timeModel,
      min,
      max,
      timeFormatted,
    };
  },
  methods: {
    clickMinute(): void {
      if (!this.useSeconds) {
        (this.$refs?.menu as any)?.save(this.timeModel);
        this.showMenu = false;
      }
    },
    clickSecond(): void {
      if (this.useSeconds) {
        (this.$refs?.menu as any)?.save(this.timeModel);
        this.showMenu = false;
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
