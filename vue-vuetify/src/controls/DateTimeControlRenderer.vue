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
          :min-width="useTabLayout ? '290px' : '580px'"
          v-bind="vuetifyProps('v-menu')"
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
              <v-card v-if="showMenu">
                <v-tabs v-if="useTabLayout" v-model="activeTab">
                  <v-tab key="date" class="primary--text">
                    <v-icon>mdi-calendar</v-icon>
                  </v-tab>
                  <v-spacer></v-spacer>
                  <v-tab key="time" class="primary--text">
                    <v-icon>mdi-clock-outline</v-icon>
                  </v-tab>
                </v-tabs>

                <v-window v-if="useTabLayout" v-model="activeTab">
                  <v-window-item value="date">
                    <v-date-picker
                      :model-value="
                        showActions ? proxyModel.value.date : pickerValue.date
                      "
                      @update:model-value="
                        (val: unknown) => {
                          if (showActions) {
                            proxyModel.value.date = val as Date;
                          } else {
                            pickerValue.date = val as Date;
                          }
                        }
                      "
                      v-bind="vuetifyProps('v-date-picker')"
                      :title="computedLabel"
                      :min="minDate"
                      :max="maxDate"
                    >
                    </v-date-picker>
                  </v-window-item>
                  <v-window-item value="time"
                    ><v-time-picker
                      :model-value="
                        showActions ? proxyModel.value.time : pickerValue.time
                      "
                      @update:model-value="
                        (val: string) => {
                          if (showActions) {
                            proxyModel.value.time = val;
                          } else {
                            pickerValue.time = val;
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
                    ></v-time-picker>
                  </v-window-item>
                </v-window>
                <v-row no-gutters v-else>
                  <v-col min-width="290px" cols="auto">
                    <v-date-picker
                      v-if="showMenu"
                      :model-value="
                        showActions ? proxyModel.value.date : pickerValue.date
                      "
                      @update:model-value="
                        (val: unknown) => {
                          if (showActions) {
                            proxyModel.value.date = val as Date;
                          } else {
                            pickerValue = {
                              date: val as Date,
                              time: pickerValue.time,
                            };
                          }
                        }
                      "
                      v-bind="vuetifyProps('v-date-picker')"
                      :title="computedLabel"
                      :min="minDate"
                      :max="maxDate"
                    >
                    </v-date-picker>
                  </v-col>
                  <v-col
                    :min-width="ampm && useSeconds ? '340px' : '290px'"
                    cols="auto"
                  >
                    <v-time-picker
                      :model-value="
                        showActions ? proxyModel.value.time : pickerValue.time
                      "
                      @update:model-value="
                        (val: string) => {
                          if (showActions) {
                            proxyModel.value.time = val;
                          } else {
                            pickerValue = {
                              date: pickerValue.date,
                              time: val,
                            };

                            showMenu = false;
                          }
                        }
                      "
                      v-bind="vuetifyProps('v-time-picker')"
                      :title="``"
                      :min="minTime"
                      :max="maxTime"
                      :use-seconds="useSeconds"
                      :format="ampm ? 'ampm' : '24hr'"
                      :ampm-in-title="ampm ? true : false"
                    ></v-time-picker>
                  </v-col>
                </v-row>

                <template v-slot:actions v-if="showActions">
                  <component :is="actions"></component>
                </template>
              </v-card>
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
  isDateTimeControl,
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
  VDatePicker,
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
  VTabs,
  VTab,
  VWindow,
  VWindowItem,
  VConfirmEdit,
} from 'vuetify/components';
import { VTimePicker } from 'vuetify/labs/VTimePicker';

import { parseDateTime, useTranslator, useVuetifyControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';

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
    VTabs,
    VTab,
    VWindow,
    VWindowItem,
    VConfirmEdit,
  },
  directives: { DisabledIconFocus },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const t = useTranslator();
    const showMenu = ref(false);
    const activeTab = ref('date');
    const adaptValue = (value: any) => value || undefined;

    const control = useVuetifyControl(useJsonFormsControl(props), adaptValue);
    return { ...control, showMenu, t, adaptValue, activeTab };
  },
  watch: {
    showMenu(show) {
      if (!show) {
        // menu is closing then reset the activeTab
        this.activeTab = 'date';
      }
    },
  },
  computed: {
    pickerIcon(): string {
      return typeof this.appliedOptions.pickerIcon == 'string'
        ? this.appliedOptions.pickerIcon
        : 'mdi-calendar-clock';
    },
    useTabLayout(): boolean {
      // use (this as any) even though on vscode editor this.$vuetify is resolve propertly during the build we get for now
      // although the definition is part of the d.ts file inside vuetify
      // error TS2339: Property '$vuetify' does not exist on type 'CreateComponentPublicInstance
      if ((this as any).$vuetify.display.mobile) {
        return true;
      }
      return false;
    },
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
    pickerValue: {
      get(): { date: Date | undefined; time: string | undefined } {
        const value = this.control.data;

        const dateTime = parseDateTime(value, this.formats);

        const date = dateTime ? dateTime.toDate() : undefined;

        const time = dateTime
          ? this.useSeconds
            ? dateTime.format('HH:mm:ss')
            : dateTime.format('HH:mm')
          : undefined;

        return { date, time };
      },
      set(val: { date: Date | undefined; time: string | undefined }) {
        this.onPickerChange(val.date, val.time);

        if (this.useTabLayout && val.date) {
          this.activeTab = 'time';
        }

        if (val.date && val.time && !this.showActions) {
          this.showMenu = false;
        }
      },
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
      const date = parseDateTime(value, this.dateTimeFormat);
      const newdata = date ? date.format(this.dateTimeSaveFormat) : value;
      if (this.adaptValue(newdata) !== this.control.data) {
        this.onChange(newdata);
      }
    },
    onPickerChange(dateValue?: Date, timeValue?: string): void {
      const date = parseDateTime(dateValue, undefined);
      const time = parseDateTime(
        timeValue ?? (this.useSeconds ? '00:00:00' : '00:00'),
        this.useSeconds ? 'HH:mm:ss' : 'HH:mm',
      );
      if (date && !time) {
        this.onChange(date!.format(this.dateTimeSaveFormat));
      } else if (date && time) {
        const dateTimeString = `${date.format('YYYY-MM-DD')}T${time.format(
          'HH:mm:ss.SSSZ',
        )}`;
        const dateTime = parseDateTime(
          dateTimeString,
          'YYYY-MM-DDTHH:mm:ss.SSSZ',
        );
        this.onChange(dateTime!.format(this.dateTimeSaveFormat));
      }
    },
    clear(): void {
      this.onChange(null);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isDateTimeControl),
};
</script>

<style lang="scss" scoped>
:deep(.v-picker) {
  border-radius: 0px;

  .v-picker__title {
    min-height: 102px;
  }
}
</style>
