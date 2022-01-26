// Pathify
import { CategorizationService } from '../../api/categorizationService';
import { make, Payload } from 'vuex-pathify';
import { AppState } from './types';
import { RootState } from '../types';
import { Module } from 'vuex';
import { createAjv, extendedVuetifyRenderers } from '@jsonforms/vue2-vuetify';
import {
  DefaultPaletteService,
  PaletteService,
} from '../../api/paletteService';
const ajv = createAjv({ useDefaults: true });

import { withCloneTree, withCloneTrees } from '../../util/clone';
import {
  findByUUID,
  getRoot,
  isEditorControl,
  isEditorLayout,
  isUUIDError,
  linkElements,
  linkSchemas,
  traverse,
  UUIDError,
} from '../../util/schemasUtil';
import { buildSchemaTree, cleanLinkedElements, SchemaElement } from '../../model/schema';
import {
  buildEditorUiSchemaTree,
  cleanUiSchemaLinks,
  EditorLayout,
  EditorUISchemaElement,
} from '../../model/uischema';

/** Removes the given UI element from its tree.
 *  If a SchemaElement is provided, the element to remove will be cleaned up from all linkedUISchemaElements fields in the schema.
 */
 const removeUiElement = (
  elementToRemove: EditorUISchemaElement,
  schema?: SchemaElement,
  categorizationService?: CategorizationService
): true | UUIDError => {
  // remove links to UI element in the schema (if any)
  if (schema && elementToRemove.linkedSchemaElement) {
    const uuidToRemove = elementToRemove.uuid;
    if (!uuidToRemove) {
      return { id: 'noUUIDError', element: elementToRemove };
    }
    const schemaRoot = getRoot(schema);
    const linkedSchemaElement: SchemaElement = findByUUID(
      schemaRoot,
      elementToRemove.linkedSchemaElement
    );
    if (!isUUIDError(linkedSchemaElement)) {
      linkedSchemaElement.linkedUISchemaElements?.delete(uuidToRemove);
    }
  }

  // remove from parent
  if (elementToRemove.parent) {
    // - case: Layout
    if ((elementToRemove.parent as EditorLayout).elements) {
      const index = (elementToRemove.parent as EditorLayout).elements.indexOf(
        elementToRemove
      );
      if (index !== -1) {
        (elementToRemove.parent as EditorLayout).elements.splice(index, 1);
      }
    }
    // - case: element with detail
    if (elementToRemove.parent.options?.detail === elementToRemove) {
      delete elementToRemove.parent.options.detail;
      if (Object.keys(elementToRemove.parent.options).length === 0) {
        delete elementToRemove.parent.options;
      }
    }

    // TODO other cases
  }

  // - case: categorization/category element
  if (
    elementToRemove.type === 'Categorization' ||
    elementToRemove.type === 'Category'
  ) {
    // release the map entry memory
    categorizationService?.removeElement(elementToRemove);
  }

  return true;
};

const state: AppState = {
  editor: {
    paletteElements: [],
    uiSchema: undefined,
    schema: undefined,
  },
  jsonforms: {
    readonly: false,
    validationMode: 'ValidateAndShow',
    config: {
      restrict: true,
      trim: false,
      showUnfocusedDescription: false,
      hideRequiredAsterisk: true,
    },
    renderers: extendedVuetifyRenderers,
    cells: extendedVuetifyRenderers,
    ajv,
    locale: 'en',
  },
  monaco: {
    schemaModel: undefined,
    uischemaModel: undefined,
    dataModel: undefined,
  },
};
// make all mutations
const mutations = {
  ...make.mutations(state),
  SET_PALLETE_ELEMENTS: (state, value) => state.editor.paletteElements = value,
  REMOVE_UISCHEMA_ELEMENT: (state, elementUUID ) => {
    const clone = withCloneTrees(
      state.editor.uiSchema,
      elementUUID,
      state.editor.schema,
      undefined,
      state,
      (elementToRemove, newSchema) => {
        console.log(elementToRemove);
        console.log(newSchema);
        if (!elementToRemove) {
          console.error('Could not remove ui element ', elementToRemove);
          return state;
        }
        const removeResult = removeUiElement(
          elementToRemove,
          newSchema,
          state.categorizationService
        );
        if (isUUIDError(removeResult)) {
          console.error('Could not remove ui element ', removeResult);
          return state;
        }
        // check whether the element to remove was the root element
        const uiSchemaToReturn = elementToRemove.parent
          ? getRoot(elementToRemove)
          : undefined;
        return {
          schema: newSchema,
          uiSchema: uiSchemaToReturn,
        };
      }
    );
    state.editor.uiSchema = clone.uiSchema;
  },
  ADD_UNSCOPED_ELEMENT_TO_LAYOUT: (state, payload) => {
    const clone = withCloneTree(
      state.editor.uiSchema,
      payload.layoutUUID,
      state.editor.uiSchema,
      (newUiSchema) => {
        // console.log(newUiSchema);
        const newUIElement = payload.uiSchemaElement;
        newUIElement.parent = newUiSchema;
        (newUiSchema as EditorLayout).elements.splice(
          payload.index,
          0,
          newUIElement
        );
        return getRoot(newUiSchema as EditorUISchemaElement);
      }
    );
    state.editor.uiSchema = clone;
  },
  ADD_SCOPED_ELEMENT_TO_LAYOUT: (state, payload) => { 
    const clone = withCloneTrees(
      state.editor.uiSchema,
      payload.layoutUUID,
      state.editor.schema,
      payload.schemaUUID,
      state,
      (newUiSchema, newSchema) => {
        const newUIElement = payload.uiSchemaElement;
        newUIElement.parent = newUiSchema;
        (newUiSchema as EditorLayout).elements.splice(
          payload.index,
          0,
          newUIElement
        );
        console.log(newUIElement);
        console.log(newSchema);

        if (!newSchema || !linkElements(newUIElement, newSchema)) {
          console.error('Could not add new UI element', newUIElement);
          return state;
        }
        

        return {
          schema: getRoot(newSchema),
          uiSchema: getRoot(newUiSchema),
        };
      }
    );
    console.log(clone);

  }
};

// const actions = make.actions(state);
const actions = {
  // automatically create only `setItems()` action
  ...make.actions(state),

  // manually add load items action
  getPaletteElements({ commit }) {
    const paletteService = new DefaultPaletteService();
    const palleteElements = paletteService.getPaletteElements();
    commit('SET_PALLETE_ELEMENTS', palleteElements);
  },
  removeUiSchemaElement({commit}, payload){
    console.log(payload);
    commit ('REMOVE_UISCHEMA_ELEMENT', payload);
  },
  addScopedElementToLayout({commit}, payload){
    commit ('ADD_SCOPED_ELEMENT_TO_LAYOUT', payload);
  },
  addUnscopedElementToLayout({commit}, payload){
    commit ('ADD_UNSCOPED_ELEMENT_TO_LAYOUT', payload);
  }
  // setSchema(){
  //   commit('SET_SCHEMA', palleteElements);
  // }
};

const getters = {};

const app: Module<AppState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

export default app;
