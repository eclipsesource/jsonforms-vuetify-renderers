
import { EditorUISchemaElement } from '../model/uischema';
import {
  createCategorization,
  createLabel,
  createLayout,
} from '../util/generators/uiSchema';

export interface PaletteService {
  getPaletteElements(): PaletteElement[];
}

export interface PaletteElement {
  type: string;
  label: string;
  icon: string;
  uiSchemaElementProvider: () => EditorUISchemaElement;
}

const paletteElements: PaletteElement[] = [
  {
    type: 'HorizontalLayout',
    label: 'Horizontal Layout',
    icon: 'mdi-arrow-expand-horizontal',
    uiSchemaElementProvider: () => createLayout('HorizontalLayout'),
  } as PaletteElement,
  {
    type: 'VerticalLayout',
    label: 'Vertical Layout',
    icon: 'mdi-arrow-expand-vertical',
    uiSchemaElementProvider: () => createLayout('VerticalLayout'),
  },
  {
    type: 'Group',
    label: 'Group',
    icon: 'mdi-group',
    uiSchemaElementProvider: () => createLayout('Group'),
  },
  {
    type: 'Label',
    label: 'Label',
    icon: 'mdi-format-letter-case-lower',
    uiSchemaElementProvider: () => createLabel(),
  },
  {
    type: 'Categorization',
    label: 'Categorization',
    icon: 'mdi-tab',
    uiSchemaElementProvider: () => createCategorization(),
  },
];

export class DefaultPaletteService implements PaletteService {
  getPaletteElements = () => paletteElements;
}
