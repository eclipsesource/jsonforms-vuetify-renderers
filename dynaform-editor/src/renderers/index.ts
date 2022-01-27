
import {extendedVuetifyRenderers } from '@jsonforms/vue2-vuetify';
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import  {DroppableHorizontalLayoutRegistration}  from './DroppableHorizontalLayoutRegistration.vue';
import  {DroppableVerticalLayoutRegistration}  from './DroppableVerticalLayoutRegistration.vue';
import {DroppableElementRegistration} from './DroppableElement.vue'
export const defaultEditorRenderers: JsonFormsRendererRegistryEntry[] = [
  ...extendedVuetifyRenderers,
    DroppableHorizontalLayoutRegistration,
    DroppableVerticalLayoutRegistration,
    DroppableElementRegistration
  ];