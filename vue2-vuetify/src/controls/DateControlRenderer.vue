// TODO: bind initial value from form data
<template>
  <div>
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      :return-value.sync="date"
      transition="scale-transition"
      offset-y
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          :value="control.data ? control.data : null"
          :label="control.label"
          v-model="date"
          :error-messages="control.errors"
          clearable
          prepend-icon="mdi-calendar"
          readonly
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        :picker-date.sync="pickerDate"
        v-model="date"
        no-title
        scrollable
      >
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
        <v-btn text color="primary" @click="$refs.menu.save(date)"> OK </v-btn>
      </v-date-picker>
    </v-menu>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isDateControl,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';
import { VDatePicker, VMenu, VSpacer, VTextField, VBtn } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'date-control-renderer',
  components: {
    VDatePicker,
    VMenu,
    VSpacer,
    VTextField,
    VBtn,
  },
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    const controlProps = useJsonFormsControl(props);
    return {
      ...controlProps,
      pickerDate: controlProps.control.data ?? null,
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      menu: false,
      modal: false,
      menu2: false,
    };
  },
  methods: {
    onChange(newValue: string) {
      this.handleChange(this.control.path, newValue ?? undefined);
    },
  },
  watch: {
    date: function (newVal) {
      this.onChange(newVal);
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isDateControl),
};
</script>
