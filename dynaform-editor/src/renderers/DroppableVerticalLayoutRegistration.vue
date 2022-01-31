<template>
  <div>
    <draggable
      :class="draggableClass"
      :list="[]"
      group="people"
      @change="handleChange"
    >
      <v-row
        v-for="(element, index) in uischema.elements"
        :key="`${layout.path}-${index}`"
        no-gutters
      >
        <v-col cols="12" :class="styles.verticalLayout.item">
          <dispatch-renderer
            :key="element.uuid"
            :schema="layout.schema"
            :uischema="element"
            :path="layout.path"
            :enabled="layout.enabled"
            :renderers="customRenderers"
            :cells="layout.cells"
          />
        </v-col>
      </v-row>
    </draggable>
  </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import {
  uiTypeIs,
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
import { DroppableElementRegistration } from "@/renderers/DroppableElement.vue";
import { EditorUISchemaElement } from "@/model";
import { createControl } from "@/util";

const layoutRenderer = defineComponent({
  name: 'vertical-layout-renderer',
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
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(useJsonFormsLayout(props));
  },
  computed: {
    draggableClass(): string {
      return 'dragArea list-group';
    },
    customRenderers(): Array<any> {
      return (
          this.renderers && [...this.renderers, DroppableElementRegistration]
      );
    },
  },
  methods: {
    handleChange(evt: any) {
      if (evt.added) {
        if (evt.added.element.uuid) {
          const uiSchemaElement: EditorUISchemaElement = createControl(
              evt.added.element
          );
          this.$store.dispatch('app/addScopedElementToLayout', {
            uiSchemaElement: uiSchemaElement,
            layoutUUID: this.uischema.uuid,
            index: 0,
            schemaUUID: evt.added.element.uuid,
          });
        } else {
          let provider = evt.added.element.uiSchemaElementProvider();
          this.$store.dispatch('app/addUnscopedElementToLayout', {
            uiSchemaElement: provider,
            layoutUUID: this.uischema.uuid,
            index: 0,
          });
        }
      }
    },
  }
});

export default layoutRenderer;

export const DroppableVerticalLayoutRegistration = {
  renderer: layoutRenderer,
  tester: rankWith(45, uiTypeIs('VerticalLayout')),
};
</script>
