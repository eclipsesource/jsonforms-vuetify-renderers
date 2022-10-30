import {
  JsonFormsUISchemaRegistryEntry,
  NOT_APPLICABLE,
  UISchemaElement,
  UISchemaTester,
} from '@jsonforms/core';

export const createJsonFormsUISchemaRegistryEntry = (
  testerString: string,
  uischema: UISchemaElement
): JsonFormsUISchemaRegistryEntry => {
  const action: UISchemaTester = (jsonSchema, schemaPath, path) => {
    try {
      const tester = new Function(
        'jsonSchema, schemaPath, path',
        `var NOT_APPLICABLE = ${NOT_APPLICABLE}; var tester = ${testerString}; return tester(jsonSchema, schemaPath, path);`
      );
      const result = tester(jsonSchema, schemaPath, path);
      if (typeof result !== 'number') {
        console.error(
          `Invalid result type, expected number but got ${typeof result}`
        );
      }
      return typeof result === 'number' ? result : NOT_APPLICABLE;
    } catch (e) {
      console.error(`Error at uischema tester: ${e}`);
      return NOT_APPLICABLE;
    }
  };

  const registryEntry = {
    tester: action,
    uischema: uischema,
  };

  return registryEntry;
};
