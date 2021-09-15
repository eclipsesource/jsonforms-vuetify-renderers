<template>
  <div>
    this is the object renderer
    <dispatch-renderer
      :schema="control.schema"
      :uischema="detailUiSchema"
      :path="control.path"
      :enabled="enabled"
      :renderers="renderers"
      :cells="cells"
    />
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  isObjectControl,
  findUISchema,
  UISchemaElement,
  GroupLayout,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControlWithDetail,
  DispatchRenderer,
} from '@jsonforms/vue2';
import { defineComponent } from '@vue/composition-api';

const controlRenderer = defineComponent({
  name: 'object-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useJsonFormsControlWithDetail(props);
  },
  computed: {
    detailUiSchema(): UISchemaElement {
      const uischema = findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        'VerticalLayout',
        this.control.uischema,
        this.control.rootSchema
      );
      return uischema;
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isObjectControl),
};
</script>
