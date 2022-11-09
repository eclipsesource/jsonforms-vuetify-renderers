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
                errors.length > 0 ||
                newPropertyName === ''
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
  encode,
  Generate,
  GroupLayout,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  useJsonFormsControlWithDetail,
} from '@jsonforms/vue2';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import startCase from 'lodash/startCase';
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
        if (propSchema.type === 'object' || propSchema.type === 'array') {
          propUiSchema = Generate.uiSchema(propSchema, 'Group');
          (propUiSchema as GroupLayout).label =
            propSchema.title ?? startCase(propName);
        } else {
          propUiSchema = createControlElement(
            control.value.path + '/' + encode(propName)
          );
        }
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

    const propertyNameErrors = ref<ErrorObject[]>([]);

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
    errors(): string[] {
      const messages = this.propertyNameErrors
        .map((error) => error.message)
        .filter((message) => message) as string[];

      if (
        this.reservedPropertyNames.includes(this.newPropertyName) ||
        this.additionalPropertyItems.find(
          (ap) => ap.propertyName === this.newPropertyName
        ) !== undefined
      ) {
        // already defined
        messages.push(
          'Property ' + this.newPropertyName + ' is already defined'
        );
      }

      // JSONForms has special means for "[]." chars - those are part of the path composition so for not we can't support those without special handling
      if (this.newPropertyName.includes('[')) {
        messages.push('Property name contains invalid char: [');
      }
      if (this.newPropertyName.includes(']')) {
        messages.push('Property name contains invalid char: ]');
      }
      if (this.newPropertyName.includes('.')) {
        messages.push('Property name contains invalid char: .');
      }

      return messages;
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
  },
  watch: {
    'control.data': {
      handler(newData) {
        // revert back any undefined values back to the default value when the key is part of the addtional properties since we want to preserved the key
        // for example when we have a string additonal property then when we clear the text component the componet by default sets the value to undefined to remove the property from the object - for additional properties we do not want that behaviour
        if (typeof this.control.data === 'object') {
          const keys = Object.keys(newData);
          let hasChanges = false;
          this.additionalPropertyItems.forEach((ap) => {
            if (
              (!keys.includes(ap.propertyName) ||
                newData[ap.propertyName] === undefined ||
                newData[ap.propertyName] === null) &&
              ap.schema
            ) {
              hasChanges = true;
              newData[ap.propertyName] = createDefaultValue(ap.schema);
            }
          });
          if (hasChanges) {
            this.input.handleChange(this.control.path, newData);
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    composePaths,
    addProperty() {
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
        // we need always to preserve the key even when the value is "empty"
        this.input.handleChange(this.control.path, this.control.data);
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
