import rule from './specification/rule.json';
import schema from './specification/schema.json';
import uischema from './specification/uischema.json';

export const jsonSchemaDraft7 = {
  uri: 'http://json-schema.org/draft-07/schema',
  schema: schema,
};

export const uiSchema = {
  uri: 'http://jsonforms.io/uischema',
  schema: uischema,
};
export const ruleSchema = {
  uri: 'http://jsonforms.io/uischema/rule',
  schema: rule,
};
