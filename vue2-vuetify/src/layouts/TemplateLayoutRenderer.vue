<template>
  <div v-if="layout.visible">
    <div v-if="templateError !== null" class="error">
      Template Error: {{ templateError }}
    </div>

    <template-compiler
      :template="template"
      :parent="parentComponent"
      :elements="elements"
      :componentComputed="componentComputed()"
      :componentMethods="componentMethods()"
      :componentFilters="componentFilters()"
      :componentComponents="componentComponents()"
    >
      <template
        v-if="elements !== undefined && elements.length == 1"
        v-slot:default
      >
        <dispatch-renderer
          :key="`${layout.path}-${0}`"
          :schema="layout.schema"
          :uischema="elements[0]"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </template>
      <template v-for="(element, index) in elements" v-slot:[`${index}`]>
        <dispatch-renderer
          :key="`${layout.path}-${index}`"
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </template>
    </template-compiler>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  JsonFormsSubStates,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import { defineComponent, Components, inject, ref } from '../vue';

import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
} from '@jsonforms/vue2';
import { useVuetifyLayout, useTranslator } from '../util';
import {
  VLabel,
  VBtn,
  VSpacer,
  VContainer,
  VRow,
  VCol,
  VIcon,
  VImg,
  VTooltip,
  VDivider,
  VCard,
  VCardText,
  VCardTitle,
  VCardSubtitle,
  VCardActions,
  VAvatar,
  VBadge,
} from 'vuetify/lib';
import TemplateCompiler from './components/TemplateCompiler.vue';
import Vue from 'vue';
import { ErrorObject } from 'ajv';
import { ComputedOptions, MethodOptions } from '../vue';

interface TemplateElement extends Layout {
  type: 'TemplateLayout';
  /**
   * The template string.
   */
  template: string;
}

const templateLayoutRenderer = defineComponent({
  name: 'template-layout-renderer',
  components: {
    DispatchRenderer,
    TemplateCompiler,
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

    let templateError = ref<string | null>(null);

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
      templateError,
    };
  },
  errorCaptured: function (err: Error, _vm: Vue, info: string) {
    if (info == 'render') {
      this.templateError = err.message;
    }
  },
  computed: {
    data(): any {
      const jsonforms: JsonFormsSubStates = this.jsonforms;
      return jsonforms.core?.data;
    },
    errors(): ErrorObject[] | undefined {
      const jsonforms: JsonFormsSubStates = this.jsonforms;
      return jsonforms.core?.errors;
    },
    template(): string | undefined {
      return (this.layout.uischema as TemplateElement).template;
    },
    elements(): UISchemaElement[] {
      return (this.layout.uischema as TemplateElement).elements;
    },
  },
  methods: {
    componentComputed(): ComputedOptions {
      const defaultComputed = {} as ComputedOptions;
      const parentComponent = this as any;

      for (const key of ['data', 'errors']) {
        defaultComputed[key] = function () {
          return parentComponent?.[key];
        };
      }

      return inject<ComputedOptions>(
        'templateLayoutRendererComponentComputed',
        defaultComputed,
        false
      );
    },
    componentMethods() {
      const defaultMethods = {
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      return inject<MethodOptions>(
        'templateLayoutRendererComponentMethods',
        defaultMethods,
        false
      );
    },
    componentFilters() {
      const defaultFilters = {
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      return inject<MethodOptions>(
        'templateLayoutRendererComponentFilters',
        defaultFilters,
        false
      );
    },
    componentComponents() {
      const defaultComponents = {
        VLabel,
        VBtn,
        VSpacer,
        VContainer,
        VRow,
        VCol,
        VIcon,
        VImg,
        VTooltip,
        VDivider,
        VCard,
        VCardText,
        VCardTitle,
        VCardSubtitle,
        VCardActions,
        VAvatar,
        VBadge,
      } as Components;

      return inject<Components>(
        'templateLayoutRendererComponentComponents',
        defaultComponents,
        false
      );
    },
    translate(
      key: string,
      defaultMessage: string | undefined
    ): string | undefined {
      return this.t(key, defaultMessage ?? '');
    },
  },
  filters: {
    translate: function (value: any) {
      if (!value) return '';
      value = value.toString();
      return this.t(value, '');
    },
  },
});

export default templateLayoutRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateLayoutRenderer,
  tester: rankWith(2, uiTypeIs('TemplateLayout')),
};
</script>
