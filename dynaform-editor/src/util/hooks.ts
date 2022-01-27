
import { buildJsonSchema, SchemaElement } from '../model';
import { buildUiSchema, EditorUISchemaElement } from '../model/uischema';

const doBuildJsonSchema = (schema: SchemaElement | undefined) =>
  schema ? buildJsonSchema(schema) : schema;

const doBuildUiSchema = (uiSchema: EditorUISchemaElement | undefined) =>
  uiSchema ? buildUiSchema(uiSchema) : undefined;

/**
 * Json Schema for export
 */
export const useExportSchema = () => {
  const schema = {
    type: 'object',
    title: 'Person',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
      },
      birthDate: {
        type: 'string',
        format: 'date',
      },
      personalData: {
        type: 'object',
        properties: {
          age: {
            type: 'integer',
            description: 'Please enter your age.',
          },
          height: {
            type: 'number',
          },
          drivingSkill: {
            type: 'number',
            maximum: 10,
            minimum: 1,
            default: 7,
          },
        },
        required: ['age', 'height'],
      },
      friends: {
        type: 'array',
        items: {
          type: 'object',
          title: 'Friend',
          properties: {
            name: {
              type: 'string',
            },
            isClose: {
              type: 'boolean',
            },
          },
        },
      },
      nationality: {
        type: 'string',
        enum: ['DE', 'IT', 'JP', 'US', 'RU', 'Other'],
      },
      occupation: {
        type: 'string',
      },
    },
  };
  return schema;
};
