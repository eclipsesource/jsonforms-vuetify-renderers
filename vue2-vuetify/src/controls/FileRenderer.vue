<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-hover v-slot="{ hover }">
      <v-file-input
        v-disabled-icon-focus
        :id="control.id + '-input'"
        :class="styles.control.input"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        :label="computedLabel"
        :hint="control.description"
        :persistent-hint="persistentHint()"
        :required="control.required"
        :error-messages="errorMessages"
        :clearable="hover"
        :accept="accept"
        v-model="currentFile"
        v-bind="vuetifyProps('v-file-input')"
        @change="selectFile"
        @focus="isFocused = true"
        @blur="isFocused = false"
      ></v-file-input>
    </v-hover>
    <v-dialog v-model="dialog" hide-overlay persistent width="300">
      <v-card>
        <v-toolbar dense flat>
          <v-toolbar-title>{{ standby }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn @click="abort" icon> <v-icon>$close</v-icon> </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-progress-linear
            v-model="progressValue"
            :indeterminate="progressIndeterminate"
            :query="true"
            height="25"
          >
            <strong>{{ Math.ceil(progressValue) }}%</strong>
          </v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </control-wrapper>
</template>

<script lang="ts">
import {
  and,
  ControlElement,
  getI18nKey,
  isStringControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
  schemaMatches,
  uiTypeIs,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import toNumber from 'lodash/toNumber';
import { defineComponent, ref } from 'vue';
import {
  VBtn,
  VCard,
  VCardText,
  VDialog,
  VFileInput,
  VHover,
  VIcon,
  VProgressLinear,
  VSpacer,
  VToolbar,
  VToolbarTitle,
} from 'vuetify/lib';
import { useTranslator, useVuetifyControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const toNonNegativeNumber = (param: any): number | undefined => {
  const result = param !== undefined ? toNumber(param) : undefined;
  return result && result >= 0 ? result : undefined;
};

const getFileSize = (
  schema: JsonSchema & {
    formatMinimum: any;
    formatMaximum: any;
    formatExclusiveMinimum: any;
    formatExclusiveMaximum: any;
  },
  uioptions:
    | {
        formatMinimum: any;
        formatMaximum: any;
        formatExclusiveMinimum: any;
        formatExclusiveMaximum: any;
      }
    | undefined,
  variant: 'min' | 'max'
): [number | undefined, boolean] => {
  let exclusive = false;
  let fileSize: number | undefined = undefined;

  if (variant === 'min') {
    fileSize = toNonNegativeNumber(schema?.formatMinimum);
    if (fileSize === undefined && schema?.formatExclusiveMinimum) {
      fileSize = toNonNegativeNumber(schema?.formatExclusiveMinimum);
      exclusive = true;
    }

    if (fileSize === undefined && uioptions) {
      if (
        typeof uioptions.formatMinimum === 'number' ||
        typeof uioptions.formatMinimum === 'string'
      ) {
        fileSize = toNonNegativeNumber(uioptions.formatMinimum);
      } else if (
        typeof uioptions.formatExclusiveMinimum === 'number' ||
        typeof uioptions.formatExclusiveMinimum === 'string'
      ) {
        fileSize = toNonNegativeNumber(uioptions.formatExclusiveMinimum);
        exclusive = true;
      }
    }
  } else {
    fileSize = toNonNegativeNumber(schema?.formatMaximum);
    if (fileSize === undefined && schema?.formatExclusiveMaximum) {
      fileSize = toNonNegativeNumber(schema?.formatExclusiveMaximum);
      exclusive = true;
    }

    if (fileSize === undefined && uioptions) {
      if (
        typeof uioptions.formatMaximum === 'number' ||
        typeof uioptions.formatMaximum === 'string'
      ) {
        fileSize = toNonNegativeNumber(uioptions.formatMaximum);
      } else if (
        typeof uioptions.formatExclusiveMaximum === 'number' ||
        typeof uioptions.formatExclusiveMaximum === 'string'
      ) {
        fileSize = toNonNegativeNumber(uioptions.formatExclusiveMaximum);
        exclusive = true;
      }
    }
  }

  return [fileSize, exclusive];
};

const toBase64 = (
  file: File,
  reader: FileReader,
  vm: { progressIndeterminate: boolean; progressValue: number },
  schemaFormat?: string
) =>
  new Promise((resolve, reject) => {
    reader.onload = () => {
      const dataurl = reader.result as string;
      if (schemaFormat === 'uri') {
        resolve(dataurl);
      } else if (schemaFormat === 'binary') {
        //special handling to encode the filename
        const insertIndex = dataurl.indexOf(';base64,');
        resolve(
          dataurl.substring(0, insertIndex) +
            `;filename=${encodeURIComponent(file.name)}` +
            dataurl.substring(insertIndex)
        );
      } else {
        resolve(dataurl.substring(dataurl.indexOf(',') + 1));
      }
    };
    reader.onabort = (error) => reject(error);
    reader.onerror = (error) => reject(error);
    reader.onprogress = (progress) => {
      if (progress.lengthComputable) {
        vm.progressIndeterminate = false;
        vm.progressValue = (progress.loaded / progress.total) * 100;
      }
    };
    reader.readAsDataURL(file);
  });

const fileRenderer = defineComponent({
  name: 'file-control-renderer',
  components: {
    VHover,
    ControlWrapper,
    DispatchRenderer,
    VFileInput,
    VDialog,
    VCard,
    VCardText,
    VProgressLinear,
    VSpacer,
    VToolbar,
    VToolbarTitle,
    VBtn,
    VIcon,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const currentFile = ref<File | undefined>(undefined);
    const currentFileReader = new FileReader();
    const currentFileValidationErrors = ref<string | null>(null);

    const t = useTranslator();
    const input = useJsonFormsControl(props);

    const dialog = ref(false);
    const progressIndeterminate = ref(true);
    const progressValue = ref(0);

    return {
      ...useVuetifyControl(input),
      t,
      dialog,
      progressValue,
      progressIndeterminate,
      currentFile,
      currentFileReader,
      currentFileValidationErrors,
    };
  },
  computed: {
    accept(): string | undefined {
      // note that we cast to any since JsonSchema7 JSONFomrs core type does not yet define contentMediaType although contentMediaType is part of JSON schema draft-07
      return (this.control.schema as any).contentMediaType;
    },
    errorMessages(): string | undefined {
      return this.currentFileValidationErrors ?? this.control.errors;
    },
    standby(): string {
      return this.t('Attaching file...', 'Attaching file...');
    },
    minFileSize(): number | undefined {
      return getFileSize(
        this.control.schema as any,
        this.appliedOptions,
        'min'
      )[0];
    },
    minFileSizeExclusive(): boolean | undefined {
      return getFileSize(
        this.control.schema as any,
        this.appliedOptions,
        'min'
      )[1];
    },
    maxFileSize(): number | undefined {
      return getFileSize(
        this.control.schema as any,
        this.appliedOptions,
        'max'
      )[0];
    },
    maxFileSizeExclusive(): boolean | undefined {
      return getFileSize(
        this.control.schema as any,
        this.appliedOptions,
        'max'
      )[1];
    },
  },
  methods: {
    reset() {
      this.dialog = false;
      this.progressIndeterminate = true;
      this.progressValue = 0;
      this.currentFileReader = new FileReader();
    },
    abort() {
      this.currentFileReader.abort();
      this.currentFile = undefined;
      this.reset();
    },
    async selectFile(value: File) {
      const schema: JsonSchema = this.control.schema;

      if (value == null) {
        this.currentFileValidationErrors = null;
      } else {
        this.currentFileValidationErrors = null;

        if (this.maxFileSize) {
          const maxFileSizeValid = this.maxFileSizeExclusive
            ? value.size < this.maxFileSize
            : value.size <= this.maxFileSize;
          if (!maxFileSizeValid) {
            const key = getI18nKey(
              this.control.schema,
              this.control.uischema,
              this.control.path,
              this.maxFileSizeExclusive
                ? 'error.formatExclusiveMaximum'
                : 'error.formatMaximum'
            );

            const formatSize = formatBytes(this.maxFileSize);
            this.currentFileValidationErrors = this.t(
              key!,
              `size should be less than ${formatSize}`,
              {
                limitText: `${formatSize}`,
                limit: `${this.maxFileSize}`,
              }
            );
          }
        }

        if (this.minFileSize) {
          const minFileSizeValid = this.minFileSizeExclusive
            ? value.size > this.minFileSize
            : value.size >= this.minFileSize;
          if (!minFileSizeValid) {
            const key = getI18nKey(
              this.control.schema,
              this.control.uischema,
              this.control.path,
              this.minFileSizeExclusive
                ? 'error.formatExclusiveMinimum'
                : 'error.formatMinimum'
            );

            const formatSize = formatBytes(this.minFileSize);
            this.currentFileValidationErrors = this.t(
              key!,
              `size should be greater than ${formatSize}`,
              {
                limitText: `${formatSize}`,
                limit: `${this.maxFileSize}`,
              }
            );
          }
        }
      }

      if (this.currentFileValidationErrors !== null) {
        this.currentFile = undefined;
      } else {
        if (value) {
          this.dialog = true;

          try {
            this.currentFileReader = new FileReader();

            const base64 = await toBase64(
              value,
              this.currentFileReader,
              this,
              schema.format
            );

            this.onChange(base64);
          } catch (e) {
            // clear the selected file when there is an error converting the file into base64
            this.currentFile = undefined;
          } finally {
            this.reset();
          }
        } else {
          this.onChange(undefined);
        }
      }
    },
  },
});

export default fileRenderer;

export const isBase64String = and(
  uiTypeIs('Control'),
  isStringControl,
  schemaMatches(
    (schema) =>
      (Object.prototype.hasOwnProperty.call(schema, 'contentEncoding') &&
        (schema as any).contentEncoding == 'base64') ||
      schema.format === 'binary' ||
      schema.format === 'byte'
  )
);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: fileRenderer,
  tester: rankWith(2, isBase64String),
};
</script>
