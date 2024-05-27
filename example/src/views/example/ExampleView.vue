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
import type { JsonFormsChangeEvent } from '@jsonforms/vue';
import {
  ValidationIcon,
  defaultStyles,
  extendedVuetifyRenderers,
  mergeStyles,
} from '@jsonforms/vue-vuetify';
import type { ErrorObject } from 'ajv';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  computed,
  onMounted,
  provide,
  ref,
  watch,
  shallowRef,
  type ShallowRef,
} from 'vue';
import { useRoute } from 'vue-router';

const appStore = useAppStore();

const myStyles = mergeStyles(defaultStyles, {
  control: { root: 'my-control' },
});

provide('styles', myStyles);

const example = shallowRef<Example | undefined>(undefined);
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
    (example.value?.input.renderers ?? []).concat(extendedVuetifyRenderers),
  ),
);

const schemaModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);
const uischemaModel = shallowRef<monaco.editor.ITextModel | undefined>(
  undefined,
);
const dataModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);
const i18nModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);

const onChange = (event: JsonFormsChangeEvent): void => {
  if (example.value) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.value.id)),
      event.data ? JSON.stringify(event.data, null, 2) : '',
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
    schemaModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toSchemaUri(example.id)),
      example.input.schema ? JSON.stringify(example.input.schema, null, 2) : '',
    );
    toast('Original example schema loaded. Apply it to take effect.');
  }
};

const saveMonacoSchema = () => {
  saveMonacoModel(
    schemaModel,
    (modelValue) =>
      (example.value = {
        ...example.value,
        input: {
          ...example.value!.input,
          schema: JSON.parse(modelValue),
        },
      } as Example),
    'New schema applied',
  );

  if (example.value && example.value.input.schema) {
    configureDataValidation(
      monaco,
      `inmemory://${toSchemaUri(example.value.id)}`,
      toDataUri(example.value.id),
      cloneDeep(example.value.input.schema),
    );
  }
};

const reloadMonacoUiSchema = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    uischemaModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toUiSchemaUri(example.id)),
      example.input.uischema
        ? JSON.stringify(example.input.uischema, null, 2)
        : '',
    );
    toast('Original example UI schema loaded. Apply it to take effect.');
  }
};

const saveMonacoUiSchema = () => {
  saveMonacoModel(
    uischemaModel,
    (modelValue) =>
      (example.value = {
        ...example.value,
        input: {
          ...example.value!.input,
          uischema: JSON.parse(modelValue),
        },
      } as Example),
    'New UI schema applied',
  );
};

const reloadMonacoData = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.id)),
      example.input.data ? JSON.stringify(example.input.data, null, 2) : '',
    );
    toast('Original example data loaded. Apply it to take effect.');
  }
};

const saveMonacoData = () => {
  saveMonacoModel(
    dataModel,
    (modelValue) =>
      (example.value = {
        ...example.value,
        input: {
          ...example.value!.input,
          data: modelValue,
        },
      } as Example),
    'New data applied',
  );
};

const reloadMonacoI18N = () => {
  const example = find(examples, (example) => example.id === route.params.id);

  if (example) {
    i18nModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toI18NUri(example.id)),
      example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : '',
    );
    toast('Original example i18n loaded. Apply it to take effect.');
  }
};

const saveMonacoI18N = () => {
  saveMonacoModel(
    i18nModel,
    (modelValue) =>
      (example.value = {
        ...example.value,
        input: {
          ...example.value!.input,
          i18n: JSON.parse(modelValue),
        },
      } as Example),
    'New i18n applied',
  );
};

const saveMonacoModel = (
  model: ShallowRef<monaco.editor.ITextModel | undefined>,
  apply: (value: string) => void,
  successToast: string,
) => {
  if (model.value && example.value) {
    const modelValue = model.value.getValue();

    try {
      apply(modelValue);
      toast(successToast);
    } catch (error) {
      toast(`Error: ${error}`);
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
        schema,
      );
    }
  }
};

const updateMonacoModels = (example: Example) => {
  schemaModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toSchemaUri(example.id)),
    example.input.schema ? JSON.stringify(example.input.schema, null, 2) : '',
  );

  uischemaModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toUiSchemaUri(example.id)),
    example.input.uischema
      ? JSON.stringify(example.input.uischema, null, 2)
      : '',
  );

  dataModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toDataUri(example.id)),
    Array.isArray(example.input.data) || typeof example.input.data === 'object'
      ? JSON.stringify(example.input.data, null, 2)
      : `${example.input.data}`,
  );

  i18nModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toI18NUri(example.id)),
    example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : '',
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
  },
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
            <v-tab :key="0"
              >Demo<validation-icon
                v-if="errors"
                :errors="errors"
              ></validation-icon
            ></v-tab>
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
                      <v-btn
                        icon
                        v-bind="props"
                        :to="{
                          name: 'example',
                          params: { id: route.params.id },
                          query: { view: 'form-only' },
                        }"
                      >
                        <v-icon>mdi-dock-window</v-icon>
                      </v-btn>
                    </template>
                    {{ `Show JsonForm Only` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <div class="json-forms">
                <demo-form
                  :example="example"
                  :renderers="allRenderers"
                  :config="appStore.jsonforms.config"
                  :validationMode="appStore.jsonforms.validationMode"
                  :ajv="ajv"
                  :readonly="appStore.jsonforms.readonly"
                  :locale="appStore.jsonforms.locale"
                  @jsfchange="onChange"
                />
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
              <monaco-editor
                :language="`json`"
                v-model="schemaModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
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
              <monaco-editor
                language="json"
                v-model="uischemaModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
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
              <monaco-editor
                language="json"
                v-model="dataModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
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
              <monaco-editor
                language="json"
                v-model="i18nModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
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
      <demo-form
        v-if="example != null && formonly"
        :example="example"
        :renderers="allRenderers"
        :config="appStore.jsonforms.config"
        :validationMode="appStore.jsonforms.validationMode"
        :ajv="ajv"
        :readonly="appStore.jsonforms.readonly"
        :locale="appStore.jsonforms.locale"
        @jsfchange="onChange"
      />
    </div>
  </div>
</template>
