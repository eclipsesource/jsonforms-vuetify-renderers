import {
  JsonFormsSubStates,
  JsonSchema,
  Layout,
  Translator,
  UISchemaElement,
} from '@jsonforms/core';
import { ErrorObject } from 'ajv';
import { AsyncComponent, Component, ref } from 'vue';
import { CompiledResultFunctions } from 'vue-template-compiler';

export interface TemplateContext {
  jsonforms: JsonFormsSubStates;

  // below are just the shortcuts for acessing the jsonforms.core
  locale?: string;
  translate?: Translator;
  data?: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  errors?: ErrorObject[];
  additionalErrors?: ErrorObject[];
}

export interface TemplateLayout extends Layout {
  type: 'TemplateLayout';
  /**
   * The template string.
   */
  template: string;
}

export type Components = {
  [key: string]:
    | Component<any, any, any, any>
    | AsyncComponent<any, any, any, any>;
};

export type CompileFunction = Promise<
  (template: string) => CompiledResultFunctions
>;

export const compileToFunctions = ref<
  ((template: string) => CompiledResultFunctions) | null
>(null);

export interface NamedUISchemaElement extends UISchemaElement {
  name: string;
}
