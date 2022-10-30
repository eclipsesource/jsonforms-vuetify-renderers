<template>
  <dispatch-renderer
    v-if="template"
    :visible="layout.visible"
    :enabled="layout.enabled"
    :schema="layout.schema"
    :uischema="template"
    :path="layout.path"
    :renderers="layout.renderers"
    :cells="layout.cells"
  />
</template>

<script lang="ts">
import {
  and,
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  Layout,
  rankWith,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsLayout,
} from '@jsonforms/vue2';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import { defineComponent, inject } from 'vue';
import { useVuetifyLayout } from '../util';

const referenceControlRenderer = defineComponent({
  name: 'template-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JsonForms?"
      );
    }

    const slotContents = inject<Record<string, UISchemaElement> | undefined>(
      'templateRendererSlotContents',
      undefined
    );

    return {
      ...layout,
      slotContents,
      jsonforms,
    };
  },
  provide() {
    const slotContents = this.slotContents
      ? Object.assign({}, this.slotContents, this.elementTemplates)
      : this.elementTemplates;

    return {
      templateRendererSlotContents: slotContents,
    };
  },
  computed: {
    name(): string {
      return (this.layout.uischema as any).name;
    },
    elementTemplates(): Record<string, UISchemaElement> {
      const elements = (this.layout.uischema as Layout)?.elements || [];

      return elements.reduce(function (result, element) {
        const name: string = (element as any).name;
        if (name) {
          result[name] = element;
        }
        return result;
      }, {} as Record<string, UISchemaElement>);
    },
    template(): UISchemaElement | undefined {
      const uischemas = this.jsonforms.uischemas;

      return uischemas
        ? find(uischemas, (entry) => (entry.uischema as any).name === this.name)
            ?.uischema
        : undefined;
    },
  },
});

export default referenceControlRenderer;

export const hasName = (uischema: any) =>
  !isEmpty(uischema) && typeof uischema.name === 'string';

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: referenceControlRenderer,
  tester: rankWith(1, and(uiTypeIs('Template'), hasName)),
};
</script>
