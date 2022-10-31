import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { VuetifyPreset } from 'vuetify/types/services/presets';

// This is needed because of the json-ref resolution when the schema url is not specified or it is relative
import * as process from 'process';
window.process = process;

Vue.use(Vuetify);

export const preset: Partial<VuetifyPreset> = {
  icons: {
    iconfont: 'mdi',
    values: {},
  },
  theme: {
    dark: false,
    default: 'light',
    disable: false,
    options: {
      cspNonce: undefined,
      customProperties: undefined,
      minifyTheme: undefined,
      themeCache: undefined,
    },
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
      },
      dark: {
        primary: '#2196F3',
        secondary: '#424242',
        accent: '#FF4081',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
      },
    },
  },
};

const vuetify = new Vuetify({
  preset,
  rtl: false,
  theme: { dark: false },
});

const theme = vuetify.framework.theme as any;
// force vuetify to use checkOrCreateStyleElement
theme.vueMeta = null;
theme.checkOrCreateStyleElement = function () {
  // do not update any style elements
  return false;
};

export default vuetify;
