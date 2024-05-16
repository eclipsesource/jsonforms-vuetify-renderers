<script setup lang="ts">
import type { Example, ResolvedSchema } from '@/core/types';
import type Ajv from 'ajv';
import type {
  ValidationMode,
  JsonFormsUISchemaRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  JsonFormsI18nState,
} from '@jsonforms/core';
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue';
import { createTranslator } from '../i18n';
import { reactive, watch, onMounted } from 'vue';
import * as JsonRefs from 'json-refs';

const props = withDefaults(
  defineProps<{
    example: Example;
    renderers: readonly JsonFormsRendererRegistryEntry[];
    config?: any;
    readonly: boolean;
    uischemas?: JsonFormsUISchemaRegistryEntry[];
    validationMode: ValidationMode;
    ajv?: Ajv;
    locale: string;
  }>(),
  {
    readonly: false,
    validationMode: 'ValidateAndShow',
    locale: 'en',
  },
);

const resolvedSchema = reactive<ResolvedSchema>({
  schema: undefined,
  resolved: false,
  error: undefined,
});

const i18n = reactive<JsonFormsI18nState>({
  locale: props.locale,
  translate: createTranslator(props.locale, props.example?.input?.i18n),
});

const emits = defineEmits(['jsfchange']);

const onChange = (event: JsonFormsChangeEvent): void => {
  console.log(event);
  emits('jsfchange', event);
};

watch(
  () => props.example,
  (newExample, oldExample) => {
    resolveSchema(newExample.input.schema);
    i18n.translate = createTranslator(
      props.locale,
      newExample?.input?.i18n as any,
    );
  },
);

watch(
  () => props.locale,
  (newLocale) => {
    i18n.locale = newLocale;
    i18n.translate = createTranslator(
      newLocale,
      props.example?.input?.i18n as any,
    );
  },
);

const resolveSchema = (schema?: JsonSchema): void => {
  resolvedSchema.schema = undefined;
  resolvedSchema.resolved = false;
  resolvedSchema.error = undefined;

  if (schema) {
    resolvedSchema.schema = schema;
    resolvedSchema.resolved = true;
    JsonRefs.resolveRefs(schema).then(
      function (res) {
        resolvedSchema.schema = res.resolved;
        resolvedSchema.resolved = true;
      },
      function (err: Error) {
        resolvedSchema.resolved = true;
        resolvedSchema.error = err.message;
      },
    );
  } else {
    // nothing to resolve
    resolvedSchema.resolved = true;
  }
};

onMounted(() => {
  resolveSchema(props.example.input.schema);
});
</script>
<template>
  <div>
    <json-forms
      v-if="resolvedSchema.resolved && resolvedSchema.error === undefined"
      :data="example.input.data"
      :schema="resolvedSchema.schema"
      :uischema="example.input.uischema"
      :renderers="renderers"
      :config="config"
      :uischemas="uischemas"
      :validationMode="validationMode"
      :ajv="ajv"
      :readonly="readonly"
      :i18n="i18n"
      @change="onChange"
    />
    <v-container v-else>
      <v-row
        v-if="!resolvedSchema.resolved"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          Resolving Schema Refs
        </v-col>
        <v-col cols="6">
          <v-progress-linear
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-row
        v-else-if="resolvedSchema.error !== undefined"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          <v-alert color="red" dark>
            {{ resolvedSchema.error }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
