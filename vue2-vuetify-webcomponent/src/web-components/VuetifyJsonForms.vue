<template>
  <div>
    <custom-style type="text/css" id="vuetify-theme">
      {{ vuetifyThemeCss }}
    </custom-style>

    <custom-style type="text/css">
      {{ customStyle }}
    </custom-style>

    <v-app ref="root">
      <div v-if="error !== undefined">
        <v-container style="height: 400px">
          <v-row class="fill-height" align-content="center" justify="center">
            <v-col class="text-subtitle-1 text-center error" cols="12">
              {{ error }}
            </v-col>
          </v-row>
        </v-container>
      </div>
      <v-sheet v-else :dark="dark" tile>
        <resolved-json-forms
          :data="dataToUse"
          :schema="schemaToUse"
          :schemaUrl="schemaUrlToUse"
          :uischema="uischemaToUse"
          :renderers="renderers"
          :cells="cells"
          :config="configToUse"
          :readonly="readonlyToUse"
          :uischemas="uischemasToUse"
          :validationMode="validationModeToUse"
          :i18n="i18nToUse"
          :additionalErrors="additionalErrorsToUse"
          @change="onChange"
        />
      </v-sheet>
    </v-app>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsI18nState,
  JsonFormsUISchemaRegistryEntry,
  NOT_APPLICABLE,
  Translator,
  UISchemaElement,
  UISchemaTester,
  ValidationMode,
} from '@jsonforms/core';
import { JsonFormsChangeEvent } from '@jsonforms/vue2';
import { extendedVuetifyRenderers } from '@jsonforms/vue2-vuetify';
import { ErrorObject } from 'ajv';
import { isArray, isPlainObject, merge } from 'lodash';
import get from 'lodash/get';
import Vue, { defineComponent, PropType, ref } from 'vue';
import LoadScript from 'vue-plugin-load-script';
import { VApp, VSheet } from 'vuetify/lib';
import { VuetifyPreset } from 'vuetify/types/services/presets';
import { ResolvedJsonForms } from '../components';
import { createTranslator } from '../core';
import vuetify, { preset as defaultPreset } from '../plugins/vuetify';

Vue.use(LoadScript);

Vue.config.productionTip = false;

const CustomStyle = defineComponent({
  name: 'custom-style',
  render(createElement) {
    return createElement('style', this.$slots.default);
  },
});

const theme = vuetify.framework.theme as any;
// force vuetify to use checkOrCreateStyleElement
theme.vueMeta = null;
theme.checkOrCreateStyleElement = function () {
  // do not update any style elements
  return false;
};

const transformUISchemas = (
  uischemas?: string
): JsonFormsUISchemaRegistryEntry[] => {
  const uischemasMap: {
    tester: string;
    uischema: UISchemaElement;
  }[] = typeof uischemas == 'string' ? JSON.parse(uischemas) : [];

  return uischemasMap
    .map((elem, index) => {
      if (elem.tester) {
        const action: UISchemaTester = (jsonSchema, schemaPath, path) => {
          try {
            const tester = new Function(
              'jsonSchema, schemaPath, path',
              `const NOT_APPLICABLE = -1; const tester = ${elem.tester}; return tester(jsonSchema, schemaPath, path);`
            );
            const result = tester(jsonSchema, schemaPath, path);
            if (typeof result !== 'number') {
              console.error(
                `Error at uischema tester[${index}]: invalid result type, expected number but got ${typeof result}`
              );
            }
            return typeof result === 'number' ? result : NOT_APPLICABLE;
          } catch (e) {
            console.error(`Error at uischema tester[${index}]: ${e}`);
            return NOT_APPLICABLE;
          }
        };
        return {
          tester: action,
          uischema: elem.uischema,
        };
      }
      return null;
    })
    .filter((x) => !!x) as JsonFormsUISchemaRegistryEntry[];
};

const vuetifyFormWc = defineComponent({
  vuetify,
  components: {
    ResolvedJsonForms,
    VApp,
    VSheet,
    CustomStyle,
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
      validator: function (value) {
        try {
          const uischemas =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            uischemas !== undefined && uischemas !== null && isArray(uischemas)
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
      validator: function (value) {
        try {
          const additionalErrors =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            additionalErrors !== undefined &&
            additionalErrors !== null &&
            isArray(additionalErrors)
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
  setup(props) {
    let error: any = undefined;

    let dataToUse: any = undefined;
    let schemaToUse: Record<string, any> | undefined = undefined;
    let schemaUrlToUse: string | undefined = undefined;
    let uischemaToUse: UISchemaElement | undefined = undefined;
    let configToUse: Record<string, any> | undefined = undefined;
    let readonlyToUse = false;
    let uischemasToUse: JsonFormsUISchemaRegistryEntry[] = [];
    let validationModeToUse: ValidationMode = 'ValidateAndShow';
    let i18nToUse: JsonFormsI18nState | undefined = undefined;
    let additionalErrorsToUse: ErrorObject[] = [];
    let translationsToUse: Record<string, any> = {};
    let localeToUse = 'en';

    let dataDefaultPreset =
      typeof props.defaultPreset == 'string'
        ? merge({}, defaultPreset, JSON.parse(props.defaultPreset))
        : defaultPreset;
    try {
      dataToUse =
        typeof props.data == 'string' ? JSON.parse(props.data) : undefined;
      schemaToUse =
        typeof props.schema == 'string' ? JSON.parse(props.schema) : undefined;
      schemaUrlToUse =
        typeof props.schemaUrl == 'string' ? props.schemaUrl : undefined;
      uischemaToUse =
        typeof props.uischema == 'string'
          ? JSON.parse(props.uischema)
          : undefined;
      configToUse =
        typeof props.config == 'string' ? JSON.parse(props.config) : undefined;

      readonlyToUse = props.readonly == 'true';

      validationModeToUse =
        props.validationMode == 'ValidateAndShow' ||
        props.validationMode == 'ValidateAndHide' ||
        props.validationMode == 'NoValidation'
          ? props.validationMode
          : 'ValidateAndShow';

      translationsToUse =
        typeof props.translations == 'string'
          ? JSON.parse(props.translations)
          : undefined;

      localeToUse = props.locale ? props.locale : localeToUse;
      i18nToUse = {
        locale: localeToUse,
        translate: createTranslator(localeToUse, translationsToUse),
      };

      dataDefaultPreset =
        typeof props.defaultPreset == 'string'
          ? merge({}, defaultPreset, JSON.parse(props.defaultPreset))
          : defaultPreset;

      uischemasToUse = transformUISchemas(props.uischemas);

      additionalErrorsToUse =
        typeof props.additionalErrors == 'string'
          ? JSON.parse(props.additionalErrors)
          : undefined;
    } catch (e) {
      error = `Config error: ${e}`;
    }

    return {
      error,
      renderers: Object.freeze(extendedVuetifyRenderers),
      cells: Object.freeze(extendedVuetifyRenderers),

      dataToUse,
      schemaToUse,
      schemaUrlToUse,
      uischemaToUse,
      configToUse,
      readonlyToUse,
      uischemasToUse,
      validationModeToUse,
      i18nToUse,
      translationsToUse,
      localeToUse,
      additionalErrorsToUse,
      dataDefaultPreset,
      vuetifyTheme: ref<{ generatedStyles: string }>(theme),
    };
  },
  watch: {
    data: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const data = typeof value == 'string' ? JSON.parse(value) : undefined;
          this.dataToUse = data;
        }
      },
    },
    schema: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const schema =
            typeof value == 'string' ? JSON.parse(value) : undefined;
          this.schemaToUse = schema;
        }
      },
    },
    schemaUrl: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const schemaUrl = typeof value == 'string' ? value : undefined;
          this.schemaUrlToUse = schemaUrl;
        }
      },
    },
    uischema: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const uischema =
            typeof value == 'string' ? JSON.parse(value) : undefined;
          this.uischemaToUse = uischema;
        }
      },
    },
    config: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const config =
            typeof value == 'string' ? JSON.parse(value) : undefined;
          this.configToUse = config;
        }
      },
    },
    readonly: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.readonlyToUse = value == 'true';
        }
      },
    },
    uischemas: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.uischemasToUse = transformUISchemas(value);
        }
      },
    },
    validationMode: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.validationModeToUse =
            value == 'ValidateAndShow' ||
            value == 'ValidateAndHide' ||
            value == 'NoValidation'
              ? value
              : 'ValidateAndShow';
        }
      },
    },
    locale: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.localeToUse = value ? value : 'en';
          this.i18nToUse = {
            locale: this.localeToUse,
            translate: createTranslator(
              this.localeToUse,
              this.translationsToUse
            ) as Translator,
          };
        }
      },
    },
    translations: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.translationsToUse =
            typeof value == 'string' ? JSON.parse(value) : {};

          this.i18nToUse = {
            locale: this.localeToUse,
            translate: createTranslator(
              this.localeToUse,
              this.translationsToUse
            ) as Translator,
          };
        }
      },
    },
    additionalErrors: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.additionalErrorsToUse =
            typeof value == 'string' ? JSON.parse(value) : [];
        }
      },
    },
    defaultPreset: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.dataDefaultPreset =
            typeof value == 'string'
              ? merge({}, defaultPreset, JSON.parse(value))
              : undefined;

          this.applyTheme();
        }
      },
    },
  },
  async mounted() {
    const shadowRoot = (this.$refs['root'] as any).$el as HTMLDivElement;

    // Monkey patch querySelector to properly find root element
    const { querySelector } = document;
    document.querySelector = function (selector: any) {
      if (selector === '[data-app]') return shadowRoot;
      return querySelector.call(this, selector);
    };

    this.applyTheme();
  },
  computed: {
    dark() {
      return this.dataDefaultPreset?.theme?.dark || false;
    },
    vuetifyThemeCss() {
      return this.vuetifyTheme?.generatedStyles;
    },
  },
  methods: {
    applyTheme(): void {
      let preset: Partial<VuetifyPreset> | null = null;
      if (this.uischemaToUse?.options) {
        preset = this.vuetifyProps(
          this.uischemaToUse.options,
          'preset'
        ) as Partial<VuetifyPreset>;
      }
      // apply any themes
      this.$vuetify.theme = merge(
        this.$vuetify.theme,
        preset && preset.theme
          ? preset.theme
          : this.dataDefaultPreset?.theme || {}
      );

      this.$vuetify.icons = merge(
        this.$vuetify.icons,
        preset && preset.icons
          ? preset.icons
          : this.dataDefaultPreset?.icons || {}
      );
    },
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
    vuetifyProps(
      options: Record<string, any>,
      path: string
    ): Record<string, any> {
      const props = get(options?.vuetify, path);

      return props && isPlainObject(props) ? props : {};
    },
  },
});

export default vuetifyFormWc;
</script>

<style scoped>
@import url('//fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');
@import '~@mdi/font/css/materialdesignicons.min.css';
@import '~vuetify/dist/vuetify.min.css';
</style>
