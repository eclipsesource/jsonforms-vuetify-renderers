<template>
  <v-label
    v-if="layout.visible"
    :class="styles.label.root"
    v-bind="vuetifyProps('v-label')"
  >
    {{ translatedLabel }}
  </v-label>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  uiTypeIs,
  LabelElement,
  JsonFormsSubStates,
  and,
  optionIs,
} from '@jsonforms/core';
import { defineComponent, inject } from '@vue/composition-api';
import {
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
} from '@jsonforms/vue2';
import { useVuetifyLayout, useTranslator } from '../util';
import { VLabel } from 'vuetify/lib';
import { ErrorObject } from 'ajv';
import { template as templateFn } from '../util/template';
import { TemplateOptions } from 'lodash';

const templateLabelRenderer = defineComponent({
  name: 'template-label-renderer',
  components: {
    VLabel,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const t = useTranslator();
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JSON Forms?"
      );
    }

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
    };
  },
  computed: {
    templateLabelRendererOptions(): TemplateOptions {
      const defaultOptions = {
        imports: {
          data: this.data,
          errors: this.errors,
          translate: this.translate.bind(this),
        },
      };
      return inject<TemplateOptions>(
        'templateLabelRendererOptions',
        defaultOptions,
        false
      );
    },
    data(): any {
      return this.jsonforms.core?.data;
    },
    errors(): ErrorObject[] | undefined {
      return this.jsonforms.core?.errors;
    },
    template(): string | undefined {
      if (this.layout.uischema.options?.i18n) {
        // try to use i18n template if the template changes based on the language
        return this.t(
          this.layout.uischema.options.i18n,
          (this.layout.uischema as LabelElement).text
        );
      }
      return (this.layout.uischema as LabelElement).text;
    },
    translatedLabel(): string | undefined {
      const compile = templateFn(
        this.template,
        this.templateLabelRendererOptions
      );

      return compile();
    },
  },
  methods: {
    translate(
      key: string,
      defaultMessage: string | undefined
    ): string | undefined {
      return this.t(key, defaultMessage ?? '');
    },
  },
});

export default templateLabelRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateLabelRenderer,
  tester: rankWith(2, and(uiTypeIs('Label'), optionIs('template', true))),
};
</script>
