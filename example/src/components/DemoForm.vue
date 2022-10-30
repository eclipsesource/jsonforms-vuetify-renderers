<template>
  <div>
    <json-forms
      v-if="resolvedSchema.resolved && resolvedSchema.error === undefined"
      :data="example.input.data"
      :schema="resolvedSchema.schema"
      :uischema="example.input.uischema"
      :renderers="renderers"
      :cells="cells"
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

<script lang="ts">
import { JsonExample, ResolvedSchema } from '@/core/types';
import { createJsonFormsUISchemaRegistryEntry } from '@/core/util';
import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsI18nState,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  ValidationMode,
} from '@jsonforms/core';
import { JsonForms, JsonFormsChangeEvent } from '@jsonforms/vue2';
import { Ajv } from 'ajv';
import JsonRefs from 'json-refs';
import _get from 'lodash/get';
import { PropType } from 'vue';
import { createTranslator } from '../i18n';

export default {
  name: 'demo-form',
  components: {
    JsonForms,
  },
  props: {
    example: { type: Object as PropType<JsonExample>, required: true },
    renderers: {
      required: true,
      type: Array as PropType<JsonFormsRendererRegistryEntry[]>,
    },
    cells: {
      required: false,
      type: Array as PropType<JsonFormsCellRendererRegistryEntry[]>,
      default: () => [],
    },
    config: {
      required: false,
      type: Object as PropType<any>,
      default: undefined,
    },
    readonly: {
      required: false,
      type: Boolean,
      default: false,
    },
    validationMode: {
      required: false,
      type: String as PropType<ValidationMode>,
      default: 'ValidateAndShow',
    },
    ajv: {
      required: false,
      type: Object as PropType<Ajv>,
      default: undefined,
    },
    locale: {
      required: false,
      type: String,
      default: 'en',
    },
  },
  data() {
    return {
      resolvedSchema: {
        schema: undefined,
        resolved: false,
        error: undefined,
      } as ResolvedSchema,
      i18n: {
        locale: this.locale,
        translate: createTranslator(this.locale, this.example?.input?.i18n),
      } as JsonFormsI18nState,
      uischemas:
        (this.example.input.uischemas?.map((entry) =>
          createJsonFormsUISchemaRegistryEntry(entry.tester, entry.uischema)
        ) as JsonFormsUISchemaRegistryEntry[]) ?? [],
    };
  },
  watch: {
    example: {
      deep: true,
      handler(newExample: JsonExample, oldExample: JsonExample): void {
        this.resolveSchema(newExample.input.schema);
        this.i18n.translate = createTranslator(
          this.locale,
          newExample?.input?.i18n as any
        );

        this.uischemas =
          newExample.input.uischemas?.map((entry) =>
            createJsonFormsUISchemaRegistryEntry(entry.tester, entry.uischema)
          ) ?? [];
      },
    },
    locale(newLocale: string): void {
      this.i18n.locale = newLocale;
      this.i18n.translate = createTranslator(
        newLocale,
        this.example?.input?.i18n as any
      );
    },
  },

  mounted() {
    this.resolveSchema(this.example.input.schema);
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
    resolveSchema(schema?: JsonSchema): void {
      const resolvedSchema = this.resolvedSchema;
      resolvedSchema.schema = undefined;
      resolvedSchema.resolved = false;
      resolvedSchema.error = undefined;

      if (schema) {
        // have custom filter
        // if not using resolve ref  then the case
        //   { "$ref": "#/definitions/state" }
        //   "definitions": {
        //    "state": { "type": "string", "enum": ["CA", "NY", "FL"] }
        //   }
        // then state won't be renderer automatically - needs to have a specified control
        //
        // if using a resolve ref but then it points to definition with $id if we resolve those then we will get
        // Error: reference "{ref}" resolves to more than one schema
        const refFilter = (refDetails: any, _path: string): boolean => {
          if (refDetails.type === 'local') {
            let uri: string | undefined = refDetails?.uriDetails?.fragment;
            uri = uri ? uri.replace(/\//g, '.') : uri;
            if (uri?.startsWith('.')) {
              uri = uri.substring(1);
            }
            if (uri && _get(schema, uri)?.$id) {
              // do not resolve ref that points to def with $id
              return false;
            }
          }
          return true;
        };

        JsonRefs.resolveRefs(schema, {
          filter: refFilter,
        }).then(
          function (res) {
            resolvedSchema.schema = res.resolved;
            resolvedSchema.resolved = true;
          },
          function (err: Error) {
            resolvedSchema.resolved = true;
            resolvedSchema.error = err.message;
          }
        );
      } else {
        // nothing to resolve
        resolvedSchema.resolved = true;
      }
    },
  },
};
</script>
