
import { buildJsonSchema, SchemaElement } from '../model';
import { buildUiSchema, EditorUISchemaElement } from '../model/uischema';
const doBuildJsonSchema = (schema: SchemaElement | undefined) =>
  schema ? buildJsonSchema(schema) : schema;

const doBuildUiSchema = (uiSchema: EditorUISchemaElement | undefined) =>
  uiSchema ? buildUiSchema(uiSchema) : undefined;


  /**
 * Ui Schema for export
 */
export const useExportUiSchema = (editorUiSchema: EditorUISchemaElement)  => {

  return useTransform(editorUiSchema, doBuildUiSchema);
};
/**
 * Json Schema for export
 */
export const useExportSchema = (editorSchema: SchemaElement) => {
  return useTransform(editorSchema, doBuildJsonSchema);
};

/**
 * Transforms the given element whenever it changes.
 */
 export const useTransform = <T1, T2>(
  element: T1,
  transform: (el: T1) => T2
) => {
  console.log(transform(element));   
  return transform(element);
};
