<template>
  <v-flex v-if="layout.visible" v-bind="vuetifyProps('v-flex')">
    <div v-if="templateError !== null" class="error">
      Template Error: {{ templateError }}
    </div>

    <template-compiler
      :template="template"
      :parent="parentComponent"
      :elements="elements"
      :componentComputed="componentComputed"
      :componentDirectives="componentDirectives"
      :componentMethods="componentMethods"
      :componentFilters="componentFilters"
      :componentComponents="componentComponents"
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
  </v-flex>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  JsonSchema,
  Layout,
  rankWith,
  Translator,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsLayout,
} from '@jsonforms/vue2';
import { ErrorObject } from 'ajv';
import { VueMaskDirective, VueMaskFilter } from 'v-mask';
import Vue, { defineComponent, inject, ref } from 'vue';
import { DirectiveFunction, DirectiveOptions } from 'vue/types/umd';
import { ComputedOptions, MethodOptions } from 'vue/types/v3-component-options';
import {
  VAutocomplete,
  VAvatar,
  VBadge,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VCol,
  VCombobox,
  VContainer,
  VDatePicker,
  VDialog,
  VDivider,
  VExpansionPanel,
  VExpansionPanelContent,
  VExpansionPanelHeader,
  VExpansionPanels,
  VFlex,
  VHover,
  VIcon,
  VInput,
  VLabel,
  VList,
  VListItem,
  VListItemAction,
  VListItemAvatar,
  VListItemContent,
  VListItemGroup,
  VListItemTitle,
  VMenu,
  VRadio,
  VRadioGroup,
  VRow,
  VSelect,
  VSimpleTable,
  VSlider,
  VSpacer,
  VSwitch,
  VTab,
  VTabItem,
  VTabs,
  VTextarea,
  VTextField,
  VTimePicker,
  VTooltip,
} from 'vuetify/lib';
import { useTranslator, useVuetifyLayout } from '../util';
import { Components } from './compile';
import TemplateCompiler from './components/TemplateCompiler.vue';

export interface TemplateContext {
  jsonforms: JsonFormsSubStates;

  // below are just the shortcuts for acessing the jsonforms.core
  locale?: string;
  translate?: Translator;
  data?: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  errors?: ErrorObject[];
  additionalErrors?: ErrorObject[];
}

export interface TemplateElement extends Layout {
  type: 'TemplateLayout';
  /**
   * The template string.
   */
  template: string;
}

const templateLayoutRenderer: any = defineComponent({
  name: 'template-layout-renderer',
  components: {
    DispatchRenderer,
    VLabel,
    VBtn,
    VSpacer,
    TemplateCompiler,
    VFlex,
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
        "'jsonforms' couldn't be injected. Are you within JsonForms?"
      );
    }

    const defaultTemplateContext = {
      jsonforms: jsonforms,
      locale: jsonforms.i18n?.locale,
      translate: jsonforms.i18n?.translate,

      data: jsonforms.core?.data,
      schema: jsonforms.core?.schema,
      uischema: jsonforms.core?.uischema,
      errors: jsonforms.core?.errors,
      additionalErrors: jsonforms.core?.additionalErrors,
    };

    const overrideTemplateContext = inject<TemplateContext | undefined>(
      'templateLayoutRendererContext',
      undefined
    );

    const templateContext = overrideTemplateContext
      ? { ...defaultTemplateContext, ...overrideTemplateContext }
      : defaultTemplateContext;

    const templateError = ref<string | null>(null);

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
      templateError,
      templateContext,
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
    componentDirectives(): Record<
      string,
      DirectiveFunction | DirectiveOptions
    > {
      const defaultDirective = { Mask: VueMaskDirective };

      const override = inject<
        Record<string, DirectiveFunction | DirectiveOptions> | undefined
      >('templateLayoutRendererComponentDirectives', undefined);

      return override ? { ...defaultDirective, ...override } : defaultDirective;
    },
    componentComputed(): ComputedOptions {
      const defaultComputed = {} as ComputedOptions;

      defaultComputed.data = () => this.data;
      defaultComputed.errors = () => this.errors;
      defaultComputed.elements = () => this.elements;
      defaultComputed.context = () => this.templateContext;

      const override = inject<ComputedOptions | undefined>(
        'templateLayoutRendererComponentComputed',
        undefined
      );
      return override ? { ...defaultComputed, ...override } : defaultComputed;
    },
    componentMethods() {
      const defaultMethods = {
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      const override = inject<MethodOptions | undefined>(
        'templateLayoutRendererComponentMethods',
        undefined
      );

      return override ? { ...defaultMethods, ...override } : defaultMethods;
    },
    componentFilters() {
      const defaultFilters = {
        VMask: VueMaskFilter,
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      const override = inject<MethodOptions | undefined>(
        'templateLayoutRendererComponentFilters',
        undefined
      );
      return override ? { ...defaultFilters, ...override } : defaultFilters;
    },
    componentComponents() {
      // by default we use only Vuetify components that are already used by other renderers
      const defaultComponents = {
        VAutocomplete,
        VAvatar,
        VBadge,
        VBtn,
        VCard,
        VCardActions,
        VCardText,
        VCardTitle,
        VCheckbox,
        VCol,
        VCombobox,
        VContainer,
        VDatePicker,
        VDialog,
        VDivider,
        VExpansionPanel,
        VExpansionPanelContent,
        VExpansionPanelHeader,
        VExpansionPanels,
        VFlex,
        VHover,
        VIcon,
        VInput,
        VLabel,
        VList,
        VListItem,
        VListItemAction,
        VListItemAvatar,
        VListItemContent,
        VListItemGroup,
        VListItemTitle,
        VMenu,
        VRadio,
        VRadioGroup,
        VRow,
        VSelect,
        VSimpleTable,
        VSlider,
        VSpacer,
        VSwitch,
        VTab,
        VTabItem,
        VTabs,
        VTextarea,
        VTextField,
        VTimePicker,
        VTooltip,
      } as Components;

      const override = inject<Components | undefined>(
        'templateLayoutRendererComponentComponents',
        undefined
      );

      return override
        ? { ...defaultComponents, ...override }
        : defaultComponents;
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
  tester: rankWith(1, uiTypeIs('TemplateLayout')),
};
</script>
