<template>
  <v-container fluid class="demo" v-if="example != null">
    <v-flex>
      <v-card>
        <v-card-title>{{ example.title }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="activeTab">
            <v-tab :key="0">Demo</v-tab>
            <v-spacer expand />
            <v-tab :key="1">Schema</v-tab>
            <v-tab :key="2">UI Schema</v-tab>
            <v-tab :key="3">Data</v-tab>

            <v-tab-item :key="0">
              <demo-form
                :example="example"
                :renderers="renderers"
                :cells="cells"
                :config="config"
                :validationMode="validationMode"
                :ajv="ajv"
                :readonly="readonly"
                @change="onChange"
              />
            </v-tab-item>
            <v-tab-item :key="1">
              <v-card>
                <v-card-title>
                  <v-toolbar flat>
                    <v-toolbar-title>Schema</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="reloadMonacoSchema">
                      <v-icon>mdi-reload</v-icon>
                    </v-btn>
                    <v-btn icon @click="saveMonacoSchema">
                      <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                  </v-toolbar>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <monaco-editor
                  :theme="$vuetify.theme.dark ? 'vs-dark' : 'vs'"
                  height="500"
                  :language="`json`"
                  v-model="monacoSchemaModel"
                  :editorBeforeMount="registerValidations"
                ></monaco-editor>
              </v-card>
            </v-tab-item>
            <v-tab-item :key="2">
              <v-card>
                <v-card-title>
                  <v-toolbar flat>
                    <v-toolbar-title>UI Schema</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="reloadMonacoUiSchema">
                      <v-icon>mdi-reload</v-icon>
                    </v-btn>
                    <v-btn icon @click="saveMonacoUiSchema">
                      <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                  </v-toolbar>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <monaco-editor
                  :theme="$vuetify.theme.dark ? 'vs-dark' : 'vs'"
                  height="500"
                  language="json"
                  v-model="monacoUiSchemaModel"
                  :editorBeforeMount="registerValidations"
                ></monaco-editor>
              </v-card>
            </v-tab-item>
            <v-tab-item :key="3">
              <v-card>
                <v-card-title>
                  <v-toolbar flat>
                    <v-toolbar-title>Data</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="reloadMonacoData">
                      <v-icon>mdi-reload</v-icon>
                    </v-btn>
                    <v-btn icon @click="saveMonacoData">
                      <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                  </v-toolbar>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <monaco-editor
                  :theme="$vuetify.theme.dark ? 'vs-dark' : 'vs'"
                  height="500"
                  language="json"
                  v-model="monacoDataModel"
                  :editorBeforeMount="registerValidations"
                ></monaco-editor>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-container>
</template>

<script lang="ts">
import { examples } from '@/components/examples';
import { find } from 'lodash';
import { sync } from 'vuex-pathify';

import { mergeStyles, defaultStyles } from '@jsonforms/vue2-vuetify';
import { JsonFormsChangeEvent } from '@jsonforms/vue2';
import MonacoEditor from '@/components/MonacoEditor.vue';
import DemoForm from '@/components/DemoForm.vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  configureJsonSchemaValidation,
  configureUISchemaValidation,
  configureDataValidation,
  EditorApi,
  getMonacoModelForUri,
} from '@/core/jsonSchemaValidation';
// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, {
  control: { root: 'my-control' },
});

export default {
  name: 'ExampleView',
  components: {
    MonacoEditor,
    DemoForm,
  },
  data() {
    return {
      activeTab: 0,
      examples,
    };
  },
  computed: {
    renderers: sync('app/jsonforms@renderers'),
    cells: sync('app/jsonforms@cells'),
    config: sync('app/jsonforms@config'),
    validationMode: sync('app/jsonforms@validationMode'),
    ajv: sync('app/jsonforms@ajv'),
    readonly: sync('app/jsonforms@readonly'),
    monacoSchemaModel: sync('app/monaco@schemaModel'),
    monacoUiSchemaModel: sync('app/monaco@uischemaModel'),
    monacoDataModel: sync('app/monaco@dataModel'),
    example() {
      const e = find(
        this.examples,
        (example) => example.id === this.$route.params.id
      );
      if (e) {
        return {
          id: e.id,
          title: e.title,
          schema: e.input.schema,
          uischema: e.input.uischema,
          data: e.input.data,
        };
      }

      return null;
    },
  },
  mounted() {
    if (this.example) {
      this.updateMonacoModels(this.example);
    }
  },
  watch: {
    example: {
      deep: true,
      handler(example: any, prev: any) {
        this.updateMonacoModels(example);
      },
    },
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      console.log('jsonform change');
    },
    reloadMonacoSchema() {
      console.log('TODO');
    },
    saveMonacoSchema() {
      const model = this.monacoSchemaModel as monaco.editor.ITextModel;
      const example = this.example;

      if (model && example) {
        const modelValue = model.getValue();
        if (modelValue) {
          let newJson: Record<string, any> | undefined = undefined;

          try {
            newJson = JSON.parse(modelValue);
          } catch (error) {
            console.error('Invalid schema JSON: ' + error);
          }

          if (newJson) {
            example.schema = newJson;
          }
        }
      }
    },
    reloadMonacoUiSchema() {
      console.log('TODO');
    },
    saveMonacoUiSchema() {
      const model = this.monacoUiSchemaModel as monaco.editor.ITextModel;
      const example = this.example;

      if (model && example) {
        const modelValue = model.getValue();
        if (modelValue) {
          let newJson: Record<string, any> | undefined = undefined;

          try {
            newJson = JSON.parse(modelValue);
          } catch (error) {
            console.error('Invalid uischema JSON: ' + error);
          }

          if (newJson) {
            example.uischema = newJson;
          }
        }
      }
    },
    reloadMonacoData() {
      console.log('TODO');
    },
    saveMonacoData() {
      const model = this.monacoDataModel as monaco.editor.ITextModel;
      const example = this.example;

      if (model && example) {
        const modelValue = model.getValue();
        if (modelValue) {
          let newJson: Record<string, any> | undefined = undefined;

          try {
            newJson = JSON.parse(modelValue);
          } catch (error) {
            console.error('Invalid Data JSON: ' + error);
          }

          if (newJson) {
            example.data = newJson;
            // notify that the example was modified
            //this.selectedExample.value = { ...example };
          }
        }
      }
    },
    registerValidations(editor: EditorApi) {
      configureJsonSchemaValidation(editor, ['*.schema.json']);
      configureUISchemaValidation(editor, ['*.uischema.json']);
      for (let example of examples) {
        const schema = {
          ...example.input.schema,
          title: example.title,
        };

        if (example && example.input.schema) {
          configureDataValidation(
            editor,
            `inmemory://${this.toSchemaUri(example.id)}`,
            this.toDataUri(example.id),
            schema
          );
        }
      }
    },
    updateMonacoModels(example) {
      this.$store.set(
        'app/monaco@schemaModel',
        getMonacoModelForUri(
          monaco.Uri.parse(this.toSchemaUri(example.id)),
          example.schema ? JSON.stringify(example.schema, null, 2) : ''
        )
      );
      this.$store.set(
        'app/monaco@uischemaModel',
        getMonacoModelForUri(
          monaco.Uri.parse(this.toUiSchemaUri(example.id)),
          example.uischema ? JSON.stringify(example.uischema, null, 2) : ''
        )
      );
      this.$store.set(
        'app/monaco@dataModel',
        getMonacoModelForUri(
          monaco.Uri.parse(this.toDataUri(example.id)),
          example.data ? JSON.stringify(example.data, null, 2) : ''
        )
      );
    },
    toSchemaUri(id: string): string {
      return `${id}.schema.json`;
    },
    toUiSchemaUri(id: string): string {
      return `${id}.uischema.json`;
    },
    toDataUri(id: string): string {
      return `${id}.data.json`;
    },
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
};
</script>

<style scoped>
.form {
  max-width: 500px;
  flex: 1;
}
.container {
  display: flex;
}
.data {
  flex: 1;
}

.demo {
  max-width: 900px;
}
</style>

<style>
/* required class */
.code-editor {
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

.vue-code-hightlight pre {
  background-color: transparent !important;
}

.vue-code-hightlight pre code {
  background-color: transparent !important;
}
</style>
