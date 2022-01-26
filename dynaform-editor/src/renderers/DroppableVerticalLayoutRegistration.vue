<template>

   <v-container
    v-if="layout.visible"
    fill-height
  >
  <h3>vertical layout</h3>
    <v-row
      v-for="(element, index) in layout.uischema.elements"
      :key="`${layout.path}-${index}`"
      no-gutters
    >
      <v-col cols="12" :class="styles.verticalLayout.item">
        <dispatch-renderer v-for="child in uischema.elements" :key="child.uuid"
          :schema="schema"
          :uischema="child"
          :path="path"
          :enabled="enabled"
          :renderers="[...renderers, DroppableElementRegistration]"
          :cells="cells"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  uiTypeIs,
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
} from '@jsonforms/vue2';
import { useVuetifyLayout } from '@jsonforms/vue2-vuetify';
import { VContainer, VRow, VCol } from 'vuetify/lib';
import  {DroppableElementRegistration}  from './DroppableElement.vue';
const layoutRenderer = defineComponent({
  name: 'vertical-layout-renderer',
  components: {
    DispatchRenderer,
    VContainer,
    VRow,
    VCol,
    DroppableElementRegistration
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(useJsonFormsLayout(props));
  },
});

export default layoutRenderer;

export const DroppableVerticalLayoutRegistration = {
  renderer: layoutRenderer,
  tester: rankWith(45, uiTypeIs('VerticalLayout')),
};
</script>
