import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
export interface AppState {
  rtl: boolean;
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
  monaco: {
    schemaModel: monaco.editor.ITextModel | undefined;
    uischemaModel: monaco.editor.ITextModel | undefined;
    dataModel: monaco.editor.ITextModel | undefined;
    i18nModel: monaco.editor.ITextModel | undefined;
  };
}

export const useAppStore = defineStore('app', () => {
  return reactive<AppState>({
    rtl: false,
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
    monaco: {
      schemaModel: undefined,
      uischemaModel: undefined,
      dataModel: undefined,
      i18nModel: undefined,
    },
  });
});
