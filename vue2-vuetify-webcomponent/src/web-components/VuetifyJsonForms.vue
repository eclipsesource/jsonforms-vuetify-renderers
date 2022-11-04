<template>
  <vuetify-json-forms
    :data="data"
    :schema="schema"
    :schemaUrl="schemaUrl"
    :uischema="uischema"
    :config="config"
    :readonly="readonly"
    :uischemas="uischemas"
    :validationMode="validationMode"
    :locale="locale"
    :customStyle="customStyle"
    :translations="translations"
    :additionalErrors="additionalErrors"
    :defaultPreset="defaultPreset"
    :uidata="uidata"
    :actions="actions"
    @change="onChange"
  ></vuetify-json-forms>
</template>

<script lang="ts">
import { ValidationMode } from '@jsonforms/core';
import { JsonFormsChangeEvent } from '@jsonforms/vue2';
const isArray = () =>
  import('lodash').then((module) => {
    const { isArray } = module;
    return isArray;
  });
import { defineComponent, PropType } from 'vue';
const VuetifyJsonForms = () => import('../components/VuetifyJsonForms.vue');

const vuetifyFormWc = defineComponent({
  components: {
    VuetifyJsonForms,
  },
  emits: ['change'],
  props: {
    data: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const data = typeof value == 'string' ? JSON.parse(value) : value;

          return data !== undefined && data !== null;
        } catch (e) {
          return false;
        }
      },
    },
    schema: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const schema = typeof value == 'string' ? JSON.parse(value) : value;

          return schema !== undefined && schema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    schemaUrl: {
      required: false,
      type: String,
      default: undefined,
    },
    uischema: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const uischema = typeof value == 'string' ? JSON.parse(value) : value;

          return uischema !== undefined && uischema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    config: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const config = typeof value == 'string' ? JSON.parse(value) : value;

          return config !== undefined && config !== null;
        } catch (e) {
          return false;
        }
      },
    },
    readonly: {
      required: false,
      type: String,
      default: 'false',
    },
    uischemas: {
      required: false,
      type: String,
      validator: async function (value) {
        const validate = await isArray();

        try {
          const uischemas =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            uischemas !== undefined && uischemas !== null && validate(uischemas)
          );
        } catch (e) {
          return false;
        }
      },
    },
    validationMode: {
      required: false,
      type: [String] as PropType<ValidationMode>,
      default: 'ValidateAndShow',
      validator: function (value) {
        return (
          value === 'ValidateAndShow' ||
          value === 'ValidateAndHide' ||
          value == 'NoValidation'
        );
      },
    },
    locale: {
      required: false,
      type: String,
      default: 'en',
    },
    customStyle: {
      required: false,
      type: String,
      default: '.v-application--wrap { min-height: 0px; }',
    },
    translations: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const translations =
            typeof value == 'string' ? JSON.parse(value) : value;

          return translations !== null;
        } catch (e) {
          return false;
        }
      },
    },
    additionalErrors: {
      required: false,
      type: String,
      validator: async function (value) {
        const validate = await isArray();
        try {
          const additionalErrors =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            additionalErrors !== undefined &&
            additionalErrors !== null &&
            validate(additionalErrors)
          );
        } catch (e) {
          return false;
        }
      },
    },
    defaultPreset: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const preset = typeof value == 'string' ? JSON.parse(value) : value;

          return preset !== undefined && preset !== null;
        } catch (e) {
          return false;
        }
      },
    },
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
  },
});

export default vuetifyFormWc;
</script>
