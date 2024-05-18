import { createVuetify, type ThemeDefinition } from 'vuetify';
import { md1 } from 'vuetify/blueprints';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

export const customThemes: (ThemeDefinition & { name: string })[] = [
  {
    name: 'dark',
    dark: true,
    colors: {
      primary: '#2196F3',
      secondary: '#54B6B2',
      error: '#CF6679',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
  },
  {
    name: 'light',
    dark: false,
    colors: {
      primary: '#1867C0',
      secondary: '#48A9A6',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
  },
  {
    name: 'Basil',
    dark: false,
    colors: {
      primary: '#356859',
      secondary: '#FD5523',
      accent: '#37966F',
      info: '#356859',
    },
  },
  {
    name: 'Crane',
    dark: false,
    colors: {
      primary: '#5D1049',
      secondary: '#E30425',
      accent: '#4E0D3A',
      info: '#5D1049',
    },
  },
  {
    name: 'Fortnightly',
    dark: false,
    colors: {
      primary: '#6B38FB',
      secondary: '#6B38FB',
      info: '#6B38FB',
    },
  },
  {
    name: 'Owl',
    dark: false,
    colors: {
      primary: '#FFDE03',
      secondary: '#0336FF',
      accent: '#FF0266',
      info: '#FFDE03',
    },
  },
  {
    name: 'Shrine',
    dark: false,
    colors: {
      primary: '#FEDBD0',
      secondary: '#FEEAE6',
      accent: '#442C2E',
      info: '#FEDBD0',
    },
  },
];

const vuetify = createVuetify({
  blueprint: md1,

  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: customThemes.reduce(
      (acc: Record<string, ThemeDefinition>, current) => {
        acc[current.name] = current;
        return acc;
      },
      {},
    ),
  },
  defaults: { VCheckbox: { color: 'primary' } },
});

export default vuetify;
