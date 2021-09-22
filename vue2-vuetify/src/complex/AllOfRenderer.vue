<template>
  <div v-if="control.visible">
    <template v-if="delegateUISchema">
      <dispatch-renderer
        :schema="_schema"
        :uischema="delegateUISchema"
        :path="control.path"
        :enabled="control.enabled"
        :renderers="control.renderers"
        :cells="control.cells"
      />
    </template>
    <template
      v-else-if="allOfRenderInfos"
      v-for="(allOfRenderInfo, allOfIndex) in allOfRenderInfos"
    >
      <dispatch-renderer
        :key="allOfIndex"
        :schema="allOfRenderInfo.schema"
        :uischema="allOfRenderInfo.uischema"
        :path="control.path"
        :enabled="control.enabled"
        :renderers="control.renderers"
        :cells="control.cells"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  CombinatorSubSchemaRenderInfo,
  ControlElement,
  createCombinatorRenderInfos,
  findMatchingUISchema,
  isAllOfControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  resolveSubSchemas,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAllOfControl,
} from '@jsonforms/vue2';
import { defineComponent } from '../vue';
import { useVuetifyControl } from '../util';

const controlRenderer = defineComponent({
  name: 'allof-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAllOfControl(props);
    const control = (input.control as any).value as typeof input.control;

    const _schema = resolveSubSchemas(
      control.schema,
      control.rootSchema,
      'allOf'
    );
    const delegateUISchema = findMatchingUISchema(control.uischemas)(
      _schema,
      control.uischema.scope,
      control.path
    );

    let allOfRenderInfos: CombinatorSubSchemaRenderInfo[] | undefined =
      undefined;

    if (delegateUISchema) {
      return {
        ...useVuetifyControl(input),
        delegateUISchema,
        _schema,
        allOfRenderInfos,
      };
    }

    allOfRenderInfos = createCombinatorRenderInfos(
      _schema.allOf!,
      control.rootSchema,
      'allOf',
      control.uischema,
      control.path,
      control.uischemas
    );

    return {
      ...useVuetifyControl(input),
      delegateUISchema,
      _schema,
      allOfRenderInfos,
    };
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAllOfControl),
};
</script>
