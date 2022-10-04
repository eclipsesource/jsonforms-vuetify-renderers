import { ValidationMode } from '@jsonforms/core';

export interface VuetifyFormConfig {
  data?: string;
  schema: string;
  schemaUrl: string;
  uischema?: string;
  uischemas?: string;
  config?: string;
  readonly?: string | boolean;
  validationMode?: ValidationMode;
  locale?: string;
  style?: string;
  translations?: string;
  defaultPreset?: string;
  additionalErrors?: string;
}
