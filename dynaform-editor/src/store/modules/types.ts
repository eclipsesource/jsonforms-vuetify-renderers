import {
  JsonFormsRendererRegistryEntry,
  JsonFormsCellRendererRegistryEntry,
} from '@jsonforms/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Ajv from 'ajv';
import { PaletteService } from '../api/paletteService';
import {
  EditorUISchemaElement,
  getUISchemaPath,
  hasChildren,
} from '../../model/uischema';
import {
  SchemaElement,

} from '../../model/schema';
// declare your own store states

export interface AppState {
  editor :{
    paletteElements: Array<any>,
    uiSchema: EditorUISchemaElement | undefined,
    schema: SchemaElement | undefined
  }
  
  jsonforms: {
    readonly: boolean;
    validationMode: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation';
    config: {
      restrict: boolean;
      trim: boolean;
      showUnfocusedDescription: boolean;
      hideRequiredAsterisk: boolean;
    };
    renderers: JsonFormsRendererRegistryEntry[];
    cells: JsonFormsCellRendererRegistryEntry[];
    ajv: Ajv;
    locale: string;
  };
  monaco: {
    schemaModel: monaco.editor.ITextModel | undefined;
    uischemaModel: monaco.editor.ITextModel | undefined;
    dataModel: monaco.editor.ITextModel | undefined;
  };
}
