<template>
  <v-card v-if="control.visible" elevation="0">
    <v-card-title>
      <v-toolbar flat>
        <v-toolbar-title>{{ computedLabel }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-hover v-slot="{ hover }">
          <v-text-field
            v-disabled-icon-focus
            :required="true"
            :class="styles.control.input"
            :error-messages="errors"
            v-model="newPropertyName"
            :clearable="hover"
            :placeholder="`New Item`"
          >
          </v-text-field>
        </v-hover>
        <v-tooltip bottom>
          <template v-slot:activator="{ on: onTooltip }">
            <v-btn
              fab
              text
              elevation="0"
              small
              :aria-label="`Add to ${computedLabel}`"
              v-on="onTooltip"
              :disabled="
                !control.enabled ||
                (appliedOptions.restrict &&
                  control.schema.maxProperties !== undefined &&
                  control.data &&
                  Object.keys(control.data).length >=
                    control.schema.maxProperties) ||
                !validNewPropertyName
              "
              @click="addProperty"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          {{ `Add to ${computedLabel}` }}
        </v-tooltip>
      </v-toolbar>
    </v-card-title>
    <v-container>
      <v-row
        v-for="(element, index) in additionalPropertyItems"
        :key="`${index}`"
      >
        <v-col>
          <dispatch-renderer
            v-if="element.schema && element.uischema"
            :schema="element.schema"
            :uischema="element.uischema"
            :path="element.path"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
        /></v-col>
        <v-col v-if="control.enabled" class="shrink">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: onTooltip }">
              <v-btn
                v-on="onTooltip"
                fab
                text
                elevation="0"
                small
                aria-label="Delete"
                :disabled="
                  !control.enabled ||
                  (appliedOptions.restrict &&
                    control.schema.minProperties !== undefined &&
                    control.data &&
                    Object.keys(control.data).length <=
                      control.schema.minProperties)
                "
                @click="removeProperty(element.propertyName)"
              >
                <v-icon class="notranslate">mdi-delete</v-icon>
              </v-btn>
            </template>
            Delete
          </v-tooltip></v-col
        >
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import {
  composePaths,
  createControlElement,
  createDefaultValue,
  formatErrorMessage,
  Generate,
  JsonSchema,
  UISchemaElement,
  validate,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  useJsonFormsControlWithDetail,
} from '@jsonforms/vue2';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import union from 'lodash/union';
import { defineComponent, PropType, Ref, ref } from 'vue';
import {
  VBtn,
  VCard,
  VCardTitle,
  VCol,
  VContainer,
  VHover,
  VIcon,
  VRow,
  VSpacer,
  VTextField,
  VToolbar,
  VToolbarTitle,
  VTooltip,
} from 'vuetify/lib';
import { DisabledIconFocus } from '../../controls/directives';
import { useStyles } from '../../styles';
import { useAjv, useControlAppliedOptions } from '../../util';

type Input = ReturnType<typeof useJsonFormsControlWithDetail>;
interface AdditionalPropertyType {
  propertyName: string;
  path: string;
  schema: JsonSchema | undefined;
  uischema: UISchemaElement | undefined;
}

const reuseAjvForSchema = (ajv: Ajv, schema: JsonSchema): Ajv => {
  if (
    Object.prototype.hasOwnProperty.call(schema, 'id') ||
    Object.prototype.hasOwnProperty.call(schema, '$id')
  ) {
    ajv.removeSchema(schema);
  }
  return ajv;
};

export default defineComponent({
  name: 'additional-properties',
  components: {
    DispatchRenderer,
    VCard,
    VTooltip,
    VToolbar,
    VIcon,
    VBtn,
    VCardTitle,
    VSpacer,
    VToolbarTitle,
    VTextField,
    VContainer,
    VRow,
    VCol,
    VHover,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    input: {
      type: Object as PropType<Input>,
      required: true,
    },
  },
  setup(props) {
    const control = props.input.control as any as Ref<
      typeof props.input.control
    >;
    const reservedPropertyNames = Object.keys(
      control.value.schema.properties || {}
    );

    const additionalKeys = Object.keys(control.value.data).filter(
      (k) => !reservedPropertyNames.includes(k)
    );

    const toAdditionalPropertyType = (
      propName: string
    ): AdditionalPropertyType => {
      let propSchema: JsonSchema | undefined = undefined;
      let propUiSchema: UISchemaElement | undefined = undefined;

      if (control.value.schema.patternProperties) {
        const matchedPattern = Object.keys(
          control.value.schema.patternProperties
        ).find((pattern) => new RegExp(pattern).test(propName));
        if (matchedPattern) {
          propSchema = control.value.schema.patternProperties[matchedPattern];
        }
      }

      if (
        !propSchema &&
        typeof control.value.schema.additionalProperties === 'object'
      ) {
        propSchema = control.value.schema.additionalProperties;
      }

      if (propSchema) {
        propUiSchema =
          propSchema.type === 'object' || propSchema.type === 'array'
            ? Generate.uiSchema(propSchema, 'VerticalLayout')
            : createControlElement(control.value.path + '/' + propName);
      }

      return {
        propertyName: propName,
        path: composePaths(control.value.path, propName),
        schema: propSchema,
        uischema: propUiSchema,
      };
    };

    const appliedOptions = useControlAppliedOptions(props.input);
    const additionalPropertyItems = ref<AdditionalPropertyType[]>([]);

    additionalKeys.forEach((propName) => {
      const additionaProperty = toAdditionalPropertyType(propName);
      additionalPropertyItems.value.push(additionaProperty);
    });

    const styles = useStyles(control.value.uischema);
    const newPropertyName = ref<string>('');
    const ajv = useAjv();
    let propertyNameValidator: ValidateFunction<unknown> | undefined =
      undefined;

    // TODO: create issue against jsonforms to add propertyNames into the JsonSchema interface
    // propertyNames exist in draft-6 but not defined in the JsonSchema
    if (typeof (control.value.schema as any).propertyNames === 'object') {
      propertyNameValidator = reuseAjvForSchema(
        ajv,
        (control.value.schema as any).propertyNames
      ).compile((control.value.schema as any).propertyNames);
    }

    const propertyNameErrors: ErrorObject[] = [];

    return {
      ajv,
      propertyNameValidator,
      propertyNameErrors,
      control,
      styles,
      appliedOptions,
      additionalPropertyItems,
      toAdditionalPropertyType,
      newPropertyName,
    };
  },
  computed: {
    errors(): string {
      const messages = this.propertyNameErrors
        .map((error) => error.message)
        .filter((message) => message) as string[];
      return formatErrorMessage(union(messages));
    },
    reservedPropertyNames(): string[] {
      return Object.keys(this.control.schema.properties || {});
    },
    computedLabel(): string | undefined {
      const additionalProperties = this.control.schema.additionalProperties;
      if (
        typeof additionalProperties === 'object' &&
        Object.prototype.hasOwnProperty.call(additionalProperties, 'title')
      ) {
        return additionalProperties.title;
      }

      return this.control.schema.title;
    },
    validNewPropertyName(): boolean {
      if (!this.newPropertyName) {
        // empty string
        return false;
      }

      if (
        this.reservedPropertyNames.includes(this.newPropertyName) ||
        this.additionalPropertyItems.find(
          (ap) => ap.propertyName === this.newPropertyName
        ) !== undefined
      ) {
        // already defined
        return false;
      }

      if (
        this.newPropertyName.includes('.') ||
        this.newPropertyName.includes('/')
      ) {
        // special character that JsonForms at the moment uses so prohibit those for now
        return false;
      }

      if (this.propertyNameValidator) {
        this.propertyNameErrors = validate(
          this.propertyNameValidator,
          this.newPropertyName
        );

        if (this.propertyNameErrors.length > 0) {
          return false;
        }
      }
      return true;
    },
  },
  methods: {
    composePaths,
    addProperty() {
      if (this.validNewPropertyName) {
        const additionaProperty = this.toAdditionalPropertyType(
          this.newPropertyName
        );
        if (additionaProperty) {
          this.additionalPropertyItems = [
            ...this.additionalPropertyItems,
            additionaProperty,
          ];
        }

        if (typeof this.control.data === 'object' && additionaProperty.schema) {
          this.control.data[this.newPropertyName] = createDefaultValue(
            additionaProperty.schema
          );
          this.input.handleChange(this.control.path, this.control.data);
        }
      }
      this.newPropertyName = '';
    },
    removeProperty(propName: string): void {
      this.additionalPropertyItems = this.additionalPropertyItems.filter(
        (d) => d.propertyName !== propName
      );
      if (typeof this.control.data === 'object') {
        delete this.control.data[propName];
        this.input.handleChange(this.control.path, this.control.data);
      }
    },
  },
});
</script>
