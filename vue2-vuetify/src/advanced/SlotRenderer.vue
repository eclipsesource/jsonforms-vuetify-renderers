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
  JsonFormsRendererRegistryEntry,
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
import { defineComponent, inject } from 'vue';
import { useVuetifyLayout } from '../util';

const slotRenderer = defineComponent({
  name: 'slot-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const slotContents = inject<Record<string, UISchemaElement>>(
      'templateRendererSlotContents',
      {}
    );

    return {
      ...layout,
      slotContents,
    };
  },
  computed: {
    name(): string {
      return (this.uischema as any).name;
    },
    slotOutlet(): UISchemaElement | undefined {
      const elements = (this.layout.uischema as Layout).elements;
      return elements && elements.length > 0 ? elements[0] : undefined;
    },
    template(): UISchemaElement | undefined {
      const slotContent = this.slotContents[this.name];
      return slotContent ? slotContent : this.slotOutlet;
    },
  },
});

export default slotRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: slotRenderer,
  tester: rankWith(1, uiTypeIs('Slot')),
};
</script>
