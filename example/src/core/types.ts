import {
  UISchemaElement,
  JsonSchema,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
} from '@jsonforms/core';

export type Example = {
  id: string;
  title: string;
  note?: string;
  input: {
    schema?: JsonSchema;
    uischema?: UISchemaElement;
    uischemas?: JsonFormsUISchemaRegistryEntry[];
    data: string | number | boolean | any[] | Record<string, any>;
    i18n?: Record<string, any>;
    renderers?: JsonFormsRendererRegistryEntry[];
  };
};

export type JsonExampleInput = Omit<Example['input'], 'uischemas'> & {
  uischemas?: {
    tester: string;
    uischema: UISchemaElement;
  }[];
};

export type JsonExample = Omit<Example, 'input'> & {
  input: JsonExampleInput;
};

export type ResolvedSchema = {
  schema?: JsonSchema;
  resolved: boolean;
  error?: string;
};
