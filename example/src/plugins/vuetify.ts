import { createVuetify, type Blueprint, type ThemeDefinition } from 'vuetify';
import { md1, md2, md3 } from 'vuetify/blueprints';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { useAppStore } from '@/stores/app';
import type { App } from 'vue';
import { watch } from 'vue';

export function getCustomThemes(blueprint: string) {
  const getThemeColors = (blueprint: string) => {
    switch (blueprint) {
      case 'md1':
        return (md1.theme as any).themes.light.colors;
      case 'md2':
        return (md2.theme as any).themes.light.colors;
      default:
        return (md3.theme as any).themes.light.colors;
    }
  };

  const customThemes: (ThemeDefinition & { name: string })[] = [
    {
      name: 'light',
      dark: false,
      colors: getThemeColors(blueprint),
    },
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

  return customThemes;
}

function toBlueprint(value: string): Blueprint {
  if (value === 'md1') {
    return md1;
  }
  if (value === 'md2') {
    return md2;
  }
  if (value === 'md3') {
    return md3;
  }
  // default
  return md1;
}

// Function to create a Vuetify instance with dynamic theme
function createVuetifyInstance(
  dark: boolean,
  blueprint: string,
  variant: string,
) {
  const defaults = variant
    ? {
        VField: {
          variant: variant,
        },
        VTextField: {
          variant: variant,
        },
        VCombobox: {
          variant: variant,
        },
        VSelect: {
          variant: variant,
        },
        VAutocomplete: {
          variant: variant,
        },
        VTextarea: {
          variant: variant,
        },
        VNumberInput: {
          variant: variant,
        },
        VCheckbox: { color: 'primary' },
      }
    : {
        VCheckbox: { color: 'primary' },
      };

  return createVuetify({
    blueprint: toBlueprint(blueprint),

    components,
    directives,
    icons: {
      defaultSet: 'mdi',
    },
    theme: {
      defaultTheme: dark ? 'dark' : 'light',
      themes: getCustomThemes(blueprint).reduce(
        (acc: Record<string, ThemeDefinition>, current) => {
          acc[current.name] = current;
          return acc;
        },
        {},
      ),
    },
    defaults: defaults,
  });
}

export function initializeVuetify(app: App) {
  const appStore = useAppStore();
  const vuetify = createVuetifyInstance(
    appStore.dark,
    appStore.blueprint,
    appStore.variant,
  );

  // Watch for changes in the variant and update Vuetify
  watch(
    () => appStore.variant,
    (variant: string) => {
      if (variant) {
        vuetify.defaults.value = {
          ...vuetify.defaults.value,
          VField: {
            ...vuetify.defaults.value?.VField,
            variant: variant,
          },
          VTextField: {
            ...vuetify.defaults.value?.VTextField,
            variant: variant,
          },
          VCombobox: {
            ...vuetify.defaults.value?.VCombobox,
            variant: variant,
          },
          VSelect: {
            ...vuetify.defaults.value?.VSelect,
            variant: variant,
          },
          VAutocomplete: {
            ...vuetify.defaults.value?.VAutocomplete,
            variant: variant,
          },
          VTextarea: {
            ...vuetify.defaults.value?.VTextarea,
            variant: variant,
          },
          VNumberInput: {
            ...vuetify.defaults.value?.VNumberInput,
            variant: variant,
          },
        };
      } else {
        delete vuetify.defaults.value?.VField?.variant;
        delete vuetify.defaults.value?.VTextField?.variant;
        delete vuetify.defaults.value?.VCombobox?.variant;
        delete vuetify.defaults.value?.VSelect?.variant;
        delete vuetify.defaults.value?.VAutocomplete?.variant;
        delete vuetify.defaults.value?.VTextarea?.variant;
        delete vuetify.defaults.value?.VNumberInput?.variant;
      }
    },
  );

  return vuetify;
}

export default initializeVuetify;
