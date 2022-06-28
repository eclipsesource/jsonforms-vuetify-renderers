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
      <v-card v-if="showMenu">
        <v-row no-gutters>
          <v-col min-width="290px">
            <v-date-picker
              v-if="showMenu"
              :value="datePickerValue"
              ref="datePicker"
              v-bind="vuetifyProps('v-date-picker')"
              :min="minDate"
              :max="maxDate"
            >
            </v-date-picker>
          </v-col>
          <v-col min-width="290px">
            <v-time-picker
              :value="timePickerValue"
              ref="timePicker"
              v-bind="vuetifyProps('v-time-picker')"
              :min="minTime"
              :max="maxTime"
              :use-seconds="useSeconds"
              :format="ampm ? 'ampm' : '24hr'"
            ></v-time-picker>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-btn text color="primary" @click="clear"> {{ clearLabel }} </v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="showMenu = false">
            {{ cancelLabel }}
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="
              () => {
                onPickerChange(
                  $refs.datePicker.inputDate,
                  $refs.timePicker.genValue()
                );
                showMenu = false;
              }
            "
          >
            {{ okLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  isDateTimeControl,
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
  VBtn,
  VDatePicker,
  VHover,
  VIcon,
  VMenu,
  VSpacer,
  VTextField,
  VTimePicker,
  VRow,
  VCol,
  VCard,
  VCardTitle,
  VCardActions,
} from 'vuetify/lib';
import { parseDateTime, useTranslator, useVuetifyControl } from '../util';
import { defineComponent } from '../vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';
import { VueMaskDirective as Mask } from 'v-mask';
import { ref } from '@vue/composition-api';
import dayjs from 'dayjs';

const JSON_SCHEMA_DATE_TIME_FORMATS = [
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ss.SSS',
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss',
];

// https://ajv.js.org/packages/ajv-formats.html#keywords-to-compare-values-formatmaximum-formatminimum-and-formatexclusivemaximum-formatexclusiveminimum
type AjvMinMaxFormat = {
  formatMinimum?: string | { $data: any };
  formatExclusiveMinimum?: string | { $data: any };
  formatMaximum?: string | { $data: any };
  formatExclusiveMaximum?: string | { $data: any };
};

const controlRenderer = defineComponent({
  name: 'datetime-control-renderer',
  components: {
    ControlWrapper,
    VBtn,
    VDatePicker,
    VTimePicker,
    VHover,
    VIcon,
    VMenu,
    VSpacer,
    VTextField,
    VRow,
    VCol,
    VCard,
    VCardTitle,
    VCardActions,
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
    dateTimeFormat(): string {
      return typeof this.appliedOptions.dateTimeFormat == 'string'
        ? this.appliedOptions.dateTimeFormat
        : 'YYYY-MM-DD HH:mm';
    },
    dateTimeSaveFormat(): string {
      return typeof this.appliedOptions.dateTimeSaveFormat == 'string'
        ? this.appliedOptions.dateTimeSaveFormat
        : 'YYYY-MM-DDTHH:mm:ssZ';
    },
    formats(): string[] {
      return [
        this.dateTimeSaveFormat,
        this.dateTimeFormat,
        ...JSON_SCHEMA_DATE_TIME_FORMATS,
      ];
    },
    useSeconds(): boolean {
      return this.dateTimeFormat.includes('s') ? true : false;
    },
    ampm(): boolean {
      return this.appliedOptions.ampm === true;
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
        const date = parseDateTime(schema.formatMinimum, this.formats);
        return date ? date.format('YYYY-MM-DD') : schema.formatMinimum;
      } else if (typeof schema.formatExclusiveMinimum === 'string') {
        let date = parseDateTime(schema.formatExclusiveMinimum, this.formats);
        if (date) {
          // the format is exclusive
          date = date.add(1, 'second');
        }
        return date ? date.format('YYYY-MM-DD') : schema.formatExclusiveMinimum;
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
        const date = parseDateTime(schema.formatMaximum, this.formats);
        return date ? date.format('YYYY-MM-DD') : schema.formatMaximum;
      } else if (typeof schema.formatExclusiveMaximum === 'string') {
        let date = parseDateTime(schema.formatExclusiveMaximum, this.formats);
        if (date) {
          // the format is exclusive
          date = date.subtract(1, 'second');
        }
        return date ? date.format('YYYY-MM-DD') : schema.formatExclusiveMaximum;
      }
      return undefined;
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
        const time = parseDateTime(schema.formatMinimum, this.formats);
        const datePicker = this.$refs?.datePicker as { inputDate?: string };

        const date = parseDateTime(datePicker?.inputDate, 'YYYY-MM-DD');

        if (date && time && date.isSame(time, 'day')) {
          // time min only matters when it is the same day

          return this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm');
        }
        return undefined;
      } else if (typeof schema.formatExclusiveMinimum === 'string') {
        let time = parseDateTime(schema.formatExclusiveMinimum, this.formats);
        const datePicker = this.$refs?.datePicker as { inputDate?: string };
        const date = parseDateTime(datePicker?.inputDate, 'YYYY-MM-DD');

        if (date && time) {
          if (time) {
            time = this.useSeconds
              ? time.add(1, 'second')
              : time.add(1, 'minute');
          }

          if (date.isSame(time, 'day')) {
            return this.useSeconds
              ? time.format('HH:mm:ss')
              : time.format('HH:mm');
          }
        }

        return undefined;
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
        const time = parseDateTime(schema.formatMaximum, this.formats);
        const datePicker = this.$refs?.datePicker as { inputDate?: string };

        const date = parseDateTime(datePicker?.inputDate, 'YYYY-MM-DD');

        if (date && time && date.isSame(time, 'day')) {
          // time min only matters when it is the same day

          return this.useSeconds
            ? time.format('HH:mm:ss')
            : time.format('HH:mm');
        }

        return undefined;
      } else if (typeof schema.formatExclusiveMaximum === 'string') {
        let time = parseDateTime(schema.formatExclusiveMaximum, this.formats);
        const datePicker = this.$refs?.datePicker as { inputDate?: string };
        const date = parseDateTime(datePicker?.inputDate, 'YYYY-MM-DD');

        if (date && time) {
          if (time) {
            time = this.useSeconds
              ? time.subtract(1, 'second')
              : time.subtract(1, 'minute');
          }

          if (date.isSame(time, 'day')) {
            return this.useSeconds
              ? time.format('HH:mm:ss')
              : time.format('HH:mm');
          }
        }
        return undefined;
      }
      return undefined;
    },
    inputValue(): string | undefined {
      const value = this.control.data;
      const date = parseDateTime(value, this.formats);
      return date ? date.format(this.dateTimeFormat) : value;
    },
    datePickerValue(): string | undefined {
      const value = this.control.data;

      const date = parseDateTime(value, this.formats);
      return date ? date.format('YYYY-MM-DD') : value;
    },
    timePickerValue(): string | undefined {
      const value = this.control.data;

      const time = parseDateTime(value, this.formats);
      return time
        ? this.useSeconds
          ? time.format('HH:mm:ss')
          : time.format('HH:mm')
        : value;
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
      const date = parseDateTime(value, this.dateTimeFormat);
      this.onChange(date ? date.format(this.dateTimeSaveFormat) : value);
    },
    onPickerChange(dateValue: string, timeValue: string): void {
      const date = parseDateTime(dateValue, 'YYYY-MM-DD');
      const time = parseDateTime(
        timeValue,
        this.useSeconds ? 'HH:mm:ss' : 'HH:mm'
      );
      if (date && time) {
        const dateTimeString = `${date.format('YYYY-MM-DD')}T${time.format(
          'HH:mm:ss.SSSZ'
        )}`;
        const dateTime = parseDateTime(
          dateTimeString,
          'YYYY-MM-DDTHH:mm:ss.SSSZ'
        );
        this.onChange(dateTime!.format(this.dateTimeSaveFormat));
      }
    },
    clear(): void {
      this.mask = undefined;
      this.onChange(null);
    },
    maskFunction(value: string): (string | RegExp)[] {
      const format = this.dateTimeFormat;

      const parts = format.split(
        /([^YMDHhmsAaSZ]*)(YYYY|YY|MMMM|MMM|MM|M|DD|D)(hh?|HH?|mm?|ss?|a|A|SSS|Z)/
      );

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
          } else if (part == 'H') {
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
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isDateTimeControl),
};
</script>

<style scoped>
.v-picker {
  border-radius: 0px;
}
.v-picker > .v-picker__title {
  min-height: 102px;
}
</style>
