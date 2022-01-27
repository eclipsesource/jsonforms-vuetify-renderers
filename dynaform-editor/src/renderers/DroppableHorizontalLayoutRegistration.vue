<template>
  <div>
    <draggable
      :class="dragableClass"
      :list="list1"
      group="people"
      @change="handleChange"
    >
      <v-col
        v-for="(element, index) in uischema.elements"
        :key="`${layout.path}-${index}`"
        fill-height
      >
        <dispatch-renderer
          :key="element.uuid"
          :schema="schema"
          :uischema="element"
          :path="path"
          :enabled="enabled"
          :renderers="customRenderers"
          :cells="cells"
        />
      </v-col>
    </draggable>
  </div>
</template>
<script lang="ts">
import draggable from 'vuedraggable';
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
import { DroppableElementRegistration } from './DroppableElement.vue';

import { EditorUISchemaElement } from '../model/uischema';
import { createControl } from '../util/generators/uiSchema';

const layoutRenderer = defineComponent({
  name: 'horizontal-layout-renderer',
  components: {
    DispatchRenderer,
    VContainer,
    VRow,
    VCol,
    draggable,
  },

  props: {
    ...rendererProps<Layout>(),
  },
  data() {
    return {
      list1: []
    };
  },
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(useJsonFormsLayout(props));
  },
  computed: {
    dragableClass(): string {
      return 'dragArea list-group row ' + this.styles.horizontalLayout.item;
    },
    customRenderers(): Array<any> {
      return (
        this.renderers && [...this.renderers, DroppableElementRegistration]
      );
    },
  },
  methods: {
    handleChange(e) {
      if (e.added) {
        if (e.added.element.uuid) {
          const uiSchemaElement: EditorUISchemaElement = createControl(
            e.added.element
          );
          this.$store.dispatch('app/addScopedElementToLayout', {
            uiSchemaElement: uiSchemaElement,
            layoutUUID: this.uischema.uuid,
            index: 0,
            schemaUUID: e.added.element.uuid,
          });
        } else {
          let provider = e.added.element.uiSchemaElementProvider();
          this.$store.dispatch('app/addUnscopedElementToLayout', {
            uiSchemaElement: provider,
            layoutUUID: this.uischema.uuid,
            index: 0,
          });
        }
      }
    },
  },
});

export default layoutRenderer;

export const DroppableHorizontalLayoutRegistration = {
  renderer: layoutRenderer,
  tester: rankWith(45, uiTypeIs('HorizontalLayout')),
};
</script>
<style scoped>
.test {
  background: #e5e5e5;
  height: 100%;
}
</style>
