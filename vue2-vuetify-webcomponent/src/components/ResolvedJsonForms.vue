<template>
  <div>
    <json-forms
      v-if="resolved && error === undefined"
      :data="data"
      :schema="schemaToUse"
      :uischema="uischema"
      :renderers="renderers"
      :cells="cells"
      :config="config"
      :readonly="readonly"
      :uischemas="uischemas"
      :validationMode="validationMode"
      :ajv="ajv"
      :i18n="i18n"
      :additionalErrors="additionalErrors"
      @change="onChange"
    ></json-forms>
    <v-container v-else style="height: 400px">
      <v-row
        v-if="error !== undefined"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          <v-alert color="red" dark>{{ errorMessage }}: {{ error }}</v-alert>
        </v-col>
      </v-row>
      <v-row
        v-else-if="!resolved"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          {{ resolvingSchemaMessage }}
        </v-col>
        <v-col cols="6">
          <v-progress-linear
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsI18nState,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  UISchemaElement,
  ValidationMode,
} from '@jsonforms/core';
import {
  JsonForms,
  JsonFormsChangeEvent,
  MaybeReadonly,
} from '@jsonforms/vue2';
import Ajv, { ErrorObject } from 'ajv';
import { normalizeId } from 'ajv/dist/compile/resolve';

import { defineComponent, PropType, ref } from 'vue';
import { VAlert, VCol, VContainer, VProgressLinear, VRow } from 'vuetify/lib';
import { resolveRefs, createAjv } from '../core';
import _get from 'lodash/get';

export const resolvedJsonFormsProps = () => ({
  data: {
    required: true,
    type: [String, Number, Boolean, Array, Object] as PropType<any>,
  },
  schema: {
    required: false,
    type: [Object, Boolean] as PropType<JsonSchema>,
    default: undefined,
  },
  schemaUrl: {
    required: false,
    type: String,
    default: undefined,
  },
  uischema: {
    required: false,
    type: Object as PropType<UISchemaElement>,
    default: undefined,
  },
  renderers: {
    required: true,
    type: Array as PropType<MaybeReadonly<JsonFormsRendererRegistryEntry[]>>,
  },
  cells: {
    required: false,
    type: Array as PropType<
      MaybeReadonly<JsonFormsCellRendererRegistryEntry[]>
    >,
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
  uischemas: {
    required: false,
    type: Array as PropType<MaybeReadonly<JsonFormsUISchemaRegistryEntry[]>>,
    default: () => [],
  },
  validationMode: {
    required: false,
    type: String as PropType<ValidationMode>,
    default: 'ValidateAndShow',
  },
  ajv: {
    required: false,
    type: Object as PropType<Ajv>,
    default: () => createAjv(),
  },
  i18n: {
    required: false,
    type: Object as PropType<JsonFormsI18nState>,
    default: undefined,
  },
  additionalErrors: {
    required: false,
    type: Array as PropType<ErrorObject[]>,
    default: () => [],
  },
});

const resolvedJsonForms = defineComponent({
  name: 'resolved-json-forms',
  components: {
    JsonForms,
    VContainer,
    VRow,
    VCol,
    VAlert,
    VProgressLinear,
  },
  emits: ['change'],
  props: {
    ...resolvedJsonFormsProps(),
  },
  setup() {
    const resolved = ref(false);
    const error = ref<any>(undefined);

    const schemaToUse = ref<JsonSchema | undefined>(undefined);

    return {
      resolved,
      error,
      schemaToUse,
    };
  },
  mounted() {
    this.resolveSchema(this.schema, this.schemaUrl);
  },
  watch: {
    async schema(newSchema) {
      this.resolveSchema(newSchema, this.schemaUrl);
    },
    async schemaUrl(newSchemaUrl) {
      this.resolveSchema(this.schema, newSchemaUrl);
    },
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
    async resolveSchema(
      schema?: JsonSchema,
      schemaUrl?: string
    ): Promise<void> {
      this.resolved = false;
      this.error = undefined;

      try {
        this.schemaToUse = schema;

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
          const resolveResult = await resolveRefs(schema, {
            location: schemaUrl,
            filter: refFilter,
          });

          this.schemaToUse = resolveResult.resolved;

          // clear previous schemas in AVJ - schema with key or id "${id}" already exists
          const { schemaId } = this.ajv.opts;
          let id = (schema as any)[schemaId];
          if (id) {
            id = normalizeId(id);
            if (id && !id.startsWith('#')) {
              if (this.ajv.getSchema(id)) {
                // schema exists and we are going to add it again so clear it before it throws schema already exists
                this.ajv.removeSchema(id);
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
        this.error = (err as Error).message;
      } finally {
        this.resolved = true;
      }
    },
  },
  computed: {
    resolvingSchemaMessage(): string {
      const message = 'Resolving Schema...';
      if (this.i18n && this.i18n.translate) {
        return this.i18n.translate(message, message);
      }
      return message;
    },
    errorMessage(): string {
      const message = 'Error resolving schema';
      if (this.i18n && this.i18n.translate) {
        return this.i18n.translate(message, message);
      }
      return message;
    },
  },
});

export default resolvedJsonForms;
</script>
