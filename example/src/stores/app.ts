import { defineStore } from 'pinia';
import { useLocalStorage, type RemovableRef } from '@vueuse/core';

export interface AppState {
  rtl: boolean;
  dark: RemovableRef<boolean>;
  drawer: boolean;
  settings: boolean;
  jsonforms: {
    readonly: boolean;
    validationMode: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation';
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
    dark: useLocalStorage('dark-mode', false, { flush: 'sync' }),
    drawer: true,
    settings: false,
    jsonforms: {
      readonly: false,
      validationMode: 'ValidateAndShow',
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
      },
      locale: 'en',
    },
  };
});
