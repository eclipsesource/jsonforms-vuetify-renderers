import schema from './schema.json';
import data from './data.json';
import type { UISchemaElement, JsonSchema } from '@jsonforms/core';

const uischema = undefined;
export const input: {
  schema: JsonSchema;
  uischema: UISchemaElement | undefined;
  data: any;
} = { schema, uischema, data };
