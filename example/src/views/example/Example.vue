<script setup lang="ts">
import DemoForm from '@/components/DemoForm.vue';
import MonacoEditor from '@/components/MonacoEditor.vue';
import {
  configureDataValidation,
  configureJsonSchemaValidation,
  configureUISchemaValidation,
  getMonacoModelForUri,
} from '@/core/jsonSchemaValidation';
import type { MonacoApi } from '@/core/monaco';
import { type Example } from '@/core/types';
import { examples } from '@/examples';
import { useAppStore } from '@/stores/app';
import { createAjv } from '@/validate';
import type { UISchemaElement } from '@jsonforms/core';
import type { JsonFormsChangeEvent } from '@jsonforms/vue';
import {
  ValidationIcon,
  defaultStyles,
  extendedVuetifyRenderers,
  mergeStyles,
} from '@jsonforms/vue-vuetify';
import type { ErrorObject } from 'ajv';
import { cloneDeep, find } from 'lodash';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { computed, onMounted, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const appStore = useAppStore();

const myStyles = mergeStyles(defaultStyles, {
  control: { root: 'my-control' },
});

provide('styles', myStyles);

const example = ref<Example | undefined>(undefined);
const ajv = createAjv();
const activeTab = ref(0);
const errors = ref<
  ErrorObject<string, Record<string, any>, unknown>[] | undefined
>(undefined);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarTimeout = ref(3000);

const route = useRoute();
const formonly = computed(() => route.query?.view === 'form-only');
const allRenderers = computed(() =>
  Object.freeze(
    (example.value?.input.renderers ?? []).concat(extendedVuetifyRenderers)
  )
);

const onChange = (event: JsonFormsChangeEvent): void => {
  if (example.value) {
    appStore.monaco.dataModel = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.value.id)),
      event.data ? JSON.stringify(event.data, null, 2) : ''
    );
  }
  errors.value = event.errors;
};

const setExample = (newExample: Example | undefined) => {
  if (newExample) {
    example.value = cloneDeep(newExample);
    updateMonacoModels(example.value);
  }
};

const reloadMonacoSchema = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    appStore.monaco.schemaModel = getMonacoModelForUri(
      monaco.Uri.parse(toSchemaUri(example.id)),
      example.input.schema ? JSON.stringify(example.input.schema, null, 2) : ''
    );
    toast('Original example schema loaded. Apply it to take effect.');
  }
};

const saveMonacoSchema = () => {
  const model = appStore.monaco.schemaModel;

  if (model && example.value) {
    // TODO: is there a better way how to get errors including the error message from monaco editor ?
    const hasError =
      model
        .getAllDecorations()
        .filter((d) => d.options.className === 'squiggly-error')
        .map((e) => e).length > 0;

    const modelValue = model.getValue().trim();
    if (!hasError) {
      const newJson: Record<string, any> = modelValue
        ? JSON.parse(modelValue)
        : undefined;
      example.value.input.schema = newJson;
      toast('New schema applied');
    } else if (hasError) {
      toast('Error: schema is invalid');
    }
  }
};

const reloadMonacoUiSchema = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    appStore.monaco.uischemaModel = getMonacoModelForUri(
      monaco.Uri.parse(toUiSchemaUri(example.id)),
      example.input.uischema
        ? JSON.stringify(example.input.uischema, null, 2)
        : ''
    );
    toast('Original example UI schema loaded. Apply it to take effect.');
  }
};

const saveMonacoUiSchema = () => {
  const model = appStore.monaco.uischemaModel;

  if (model && example.value) {
    // TODO: is there a better way how to get errors including the error message from monaco editor ?
    const hasError =
      model
        .getAllDecorations()
        .filter((d) => d.options.className === 'squiggly-error')
        .map((e) => e).length > 0;

    const modelValue = model.getValue().trim();
    if (!hasError) {
      const newJson: Record<string, any> = modelValue
        ? JSON.parse(modelValue)
        : undefined;

      example.value.input.uischema = newJson as UISchemaElement;
      toast('New UI schema applied');
    } else if (hasError) {
      toast('Error: UI schema is invalid');
    }
  }
};

const reloadMonacoData = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    appStore.monaco.dataModel = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.id)),
      example.input.data ? JSON.stringify(example.input.data, null, 2) : ''
    );
    toast('Original example data loaded. Apply it to take effect.');
  }
};

const saveMonacoData = () => {
  const model = appStore.monaco.dataModel;

  if (model && example.value) {
    // do not check for monaco errors just if this is valid JSON becase we want to see when we have validation errors

    const modelValue = model.getValue().trim();
    if (modelValue) {
      let newJson: Record<string, any> | undefined = undefined;

      try {
        newJson = JSON.parse(modelValue);
      } catch (error) {
        toast(`Error: ${error}`);
      }

      if (newJson) {
        example.value.input.data = newJson;
        toast('New data applied');
      }
    }
  }
};

const reloadMonacoI18N = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    appStore.monaco.i18nModel = getMonacoModelForUri(
      monaco.Uri.parse(toI18NUri(example.id)),
      example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : ''
    );
    toast('Original example i18n loaded. Apply it to take effect.');
  }
};

const saveMonacoI18N = () => {
  const model = appStore.monaco.i18nModel;

  if (model && example.value) {
    // TODO: is there a better way how to get errors including the error message from monaco editor ?
    const hasError =
      model
        .getAllDecorations()
        .filter((d) => d.options.className === 'squiggly-error')
        .map((e) => e).length > 0;

    const modelValue = model.getValue().trim();
    if (!hasError) {
      const newJson: Record<string, any>[] = modelValue
        ? JSON.parse(modelValue)
        : undefined;

      example.value.input.i18n = newJson;
      toast('New i18n applied');
    } else if (hasError) {
      toast('Error: i18n is invalid');
    }
  }
};

const registerValidations = (editor: MonacoApi) => {
  configureJsonSchemaValidation(editor, ['*.schema.json']);
  configureUISchemaValidation(editor, ['*.uischema.json']);
  for (const example of examples) {
    const schema = {
      ...example.input.schema,
      title: example.title,
    };

    if (example && example.input.schema) {
      configureDataValidation(
        editor,
        `inmemory://${toSchemaUri(example.id)}`,
        toDataUri(example.id),
        schema
      );
    }
  }
};

const updateMonacoModels = (example: Example) => {
  appStore.monaco.schemaModel = getMonacoModelForUri(
    monaco.Uri.parse(toSchemaUri(example.id)),
    example.input.schema ? JSON.stringify(example.input.schema, null, 2) : ''
  );

  appStore.monaco.uischemaModel = getMonacoModelForUri(
    monaco.Uri.parse(toUiSchemaUri(example.id)),
    example.input.uischema
      ? JSON.stringify(example.input.uischema, null, 2)
      : ''
  );

  appStore.monaco.dataModel = getMonacoModelForUri(
    monaco.Uri.parse(toDataUri(example.id)),
    example.input.data ? JSON.stringify(example.input.data, null, 2) : ''
  );

  appStore.monaco.i18nModel = getMonacoModelForUri(
    monaco.Uri.parse(toI18NUri(example.id)),
    example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : ''
  );
};

const toSchemaUri = (id: string): string => {
  return `${id}.schema.json`;
};
const toUiSchemaUri = (id: string): string => {
  return `${id}.uischema.json`;
};
const toDataUri = (id: string): string => {
  return `${id}.data.json`;
};
const toI18NUri = (id: string): string => {
  return `${id}.i18n.json`;
};
const toast = (message: string): void => {
  snackbar.value = true;
  snackbarText.value = message;
};

watch(
  () => route.params.id,
  (id) => {
    setExample(find(examples, (example) => example.id === id));
  }
);

onMounted(() => {
  setExample(find(examples, (example) => example.id === route.params.id));
});
</script>

<template>
  <div>
    <v-container fluid class="demo" v-if="example != null && !formonly">
      <v-card>
        <v-card-title>{{ example.title }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="activeTab">
            <v-tab :key="0">Demo<validation-icon v-if="errors" :errors="errors"></validation-icon></v-tab>
            <v-spacer expand />
            <v-tab :key="1">Schema</v-tab>
            <v-tab :key="2">UI Schema</v-tab>
            <v-tab :key="3">Data</v-tab>
            <v-tab :key="4">Internationalization</v-tab>
          </v-tabs>
        </v-card-text>
        <v-window v-model="activeTab">
          <v-window-item :key="0">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>JSONForm</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon v-bind="props" :to="{
                          name: 'example',
                          params: { id: route.params.id },
                          query: { view: 'form-only' },
                        }">
                        <v-icon>mdi-dock-window</v-icon>
                      </v-btn>
                    </template>
                    {{ `Show JsonForm Only` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <div class="json-forms">
                <demo-form :example="example" :renderers="allRenderers" :config="appStore.jsonforms.config"
                  :validationMode="appStore.jsonforms.validationMode" :ajv="ajv" :readonly="appStore.jsonforms.readonly"
                  :locale="appStore.jsonforms.locale" @jsfchange="onChange" />
              </div>
            </v-card>
          </v-window-item>
          <v-window-item :key="1">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Schema</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoSchema" v-bind="props">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Schema` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoSchema" v-bind="props">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Schema` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor :language="`json`" v-model="appStore.monaco.schemaModel"
                :editorBeforeMount="registerValidations"></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="2">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>UI Schema</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoUiSchema" v-bind="props">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example UI Schema` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoUiSchema" v-bind="props">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example UI Schema` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor language="json" v-model="appStore.monaco.uischemaModel"
                :editorBeforeMount="registerValidations"></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="3">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Data</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoData" v-bind="props">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Data` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoData" v-bind="props">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Data` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor language="json" v-model="appStore.monaco.dataModel"
                :editorBeforeMount="registerValidations"></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="4">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Internationalization</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoI18N" v-bind="props">
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Internationalization` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoI18N" v-bind="props">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Data` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor language="json" v-model="appStore.monaco.i18nModel"
                :editorBeforeMount="registerValidations"></monaco-editor>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
      <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-container>
    <div class="json-forms">
      <demo-form v-if="example != null && formonly" :example="example" :renderers="allRenderers"
        :config="appStore.jsonforms.config" :validationMode="appStore.jsonforms.validationMode" :ajv="ajv"
        :readonly="appStore.jsonforms.readonly" :locale="appStore.jsonforms.locale" @jsfchange="onChange" />
    </div>
  </div>
</template>
