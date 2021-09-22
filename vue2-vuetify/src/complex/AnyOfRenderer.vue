<template>
  <div v-if="control.visible">
    <combinator-properties
      :schema="_schema"
      :combinatorKeyword="'anyOf'"
      :path="path"
    />

    <v-tabs v-model="selectedIndex">
      <v-tab
        v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
        :key="`${control.path}-${anyOfIndex}`"
      >
        {{ anyOfRenderInfo.label }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="selectedIndex">
      <v-tab-item
        v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
        :key="`${control.path}-${anyOfIndex}`"
      >
        <dispatch-renderer
          v-if="selectedIndex === anyOfIndex"
          :key="anyOfIndex"
          :schema="anyOfRenderInfo.schema"
          :uischema="anyOfRenderInfo.uischema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import {
  ControlElement,
  createCombinatorRenderInfos,
  isAnyOfControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  resolveSubSchemas,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAnyOfControl,
} from '@jsonforms/vue2';
import { VTabs, VTab, VTabsItems, VTabItem } from 'vuetify/lib';
import { defineComponent, ref } from '../vue';
import { useVuetifyControl } from '../util';
import { CombinatorProperties } from './components';

const controlRenderer = defineComponent({
  name: 'anyof-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props);
    const control = (input.control as any).value as typeof input.control;

    const _schema = resolveSubSchemas(
      control.schema,
      control.rootSchema,
      'anyOf'
    );
    const anyOfRenderInfos = createCombinatorRenderInfos(
      _schema.anyOf!,
      control.rootSchema,
      'anyOf',
      control.uischema,
      control.path,
      control.uischemas
    );

    const selectedIndex = ref(control.indexOfFittingSchema || 0);

    return {
      ...useVuetifyControl(input),
      _schema,
      anyOfRenderInfos,
      selectedIndex,
    };
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAnyOfControl),
};
</script>
