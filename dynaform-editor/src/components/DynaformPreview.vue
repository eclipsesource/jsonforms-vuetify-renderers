<template>
  <div>
    <json-forms
      v-if="resolvedSchema.resolved && resolvedSchema.error === undefined"
      :data="{}"
      :schema="resolvedSchema.schema"
      :uischema="useUiSchema"
      :renderers="renderers"
      :cells="renderers"
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
import { ResolvedSchema } from '@/core/types';
import { JsonSchema, JsonFormsI18nState } from '@jsonforms/core';
import { JsonForms, JsonFormsChangeEvent } from '@jsonforms/vue2';
import JsonRefs from 'json-refs';
import { createTranslator } from '../i18n';
import { useExportSchema, useExportUiSchema} from '../util';
import { extendedVuetifyRenderers } from '@jsonforms/vue2-vuetify';
import { sync } from 'vuex-pathify';
export default {
  name: 'dymaform-preview',
  components: {
    JsonForms,
  },
  props: {
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
        translate: createTranslator(this.locale),
      } as JsonFormsI18nState,
      renderers: extendedVuetifyRenderers,
    };
  },
  watch: {
    locale(newLocale: string): void {
      console.log('LOCALE SWITCH', newLocale);
      this.i18n.locale = newLocale;
      this.i18n.translate = createTranslator(newLocale);
    },
  },
  computed: {
    useUiSchema:function() { 
      // console.log(sync('app/editor@uiSchema'));
      return useExportUiSchema(this.$store.get('app/editor@uiSchema'))
    },
  },
  mounted() {
    this.resolveSchema(useExportSchema(this.$store.get('app/editor@schema')));
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
        JsonRefs.resolveRefs(schema).then(
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
