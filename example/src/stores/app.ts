import { defineStore } from 'pinia';
import { useLocalStorage, type RemovableRef } from '@vueuse/core';
import type { ValidationMode } from '@jsonforms/core';

export interface AppState {
  rtl: boolean;
  blueprint: RemovableRef<string>;
  dark: boolean;
  theme: RemovableRef<string>;
  variant: RemovableRef<string>;
  drawer: boolean;
  settings: boolean;
  jsonforms: {
    readonly: boolean;
    validationMode: ValidationMode;
    config: {
      restrict: boolean;
      trim: boolean;
      showUnfocusedDescription: boolean;
      hideRequiredAsterisk: boolean;
      collapseNewItems: boolean;
      initCollapsed: boolean;
      breakHorizontal: false | string;
      hideAvatar: boolean;
      hideArraySummaryValidation: boolean;
      vuetify?: Record<string, any>;
    };
    locale: string;
  };
}

export const useAppStore = defineStore('app', () => {
  return {
    rtl: false,
    dark: useLocalStorage('dark', false),
    theme: useLocalStorage('theme', 'light'),
    variant: useLocalStorage('variant', ''),
    blueprint: useLocalStorage('blueprint', 'md1'),
    drawer: true,
    settings: false,
    jsonforms: {
      readonly: false,
      validationMode: 'ValidateAndShow' as ValidationMode,
      config: {
        restrict: true,
        trim: false,
        showUnfocusedDescription: false,
        hideRequiredAsterisk: true,
        collapseNewItems: false,
        breakHorizontal: false,
        initCollapsed: false,
        hideAvatar: false,
        hideArraySummaryValidation: false,
        vuetify: {},
      },
      locale: 'en',
    },
  };
});
