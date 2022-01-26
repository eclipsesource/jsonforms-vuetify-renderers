
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';

import  {DroppableHorizontalLayoutRegistration}  from './DroppableHorizontalLayoutRegistration.vue';
import  {DroppableVerticalLayoutRegistration}  from './DroppableVerticalLayoutRegistration.vue';
import {DroppableElementRegistration} from './DroppableElement.vue'
export const defaultEditorRenderers: JsonFormsRendererRegistryEntry[] = [
    DroppableHorizontalLayoutRegistration,
    DroppableVerticalLayoutRegistration,
    DroppableElementRegistration
  ];