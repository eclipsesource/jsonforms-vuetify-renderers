<template>
  <div v-if="layout.visible" :class="styles.categorization.root">
    <v-stepper-vertical
      v-if="appliedOptions.vertical == true"
      non-linear
      v-model="activeCategory"
      editable
      v-bind="vuetifyProps('v-stepper-vertical')"
      :hide-actions="!appliedOptions.showNavButtons"
    >
      <v-stepper-vertical-item
        :title="visibleCategoryLabels[index]"
        v-for="(element, index) in visibleCategories"
        :value="index + 1"
      >
        <v-card elevation="0">
          <dispatch-renderer
            :schema="layout.schema"
            :uischema="element"
            :path="layout.path"
            :enabled="layout.enabled"
            :renderers="layout.renderers"
            :cells="layout.cells"
          />
        </v-card>
      </v-stepper-vertical-item>
    </v-stepper-vertical>
    <v-stepper
      v-else
      non-linear
      v-model="activeCategory"
      v-bind="vuetifyProps('v-stepper')"
    >
      <template v-slot:default="{ prev, next }">
        <v-stepper-header>
          <template v-for="(_, index) in visibleCategories" :key="index">
            <v-stepper-item :value="index + 1" editable>
              {{ visibleCategoryLabels[index] }}
            </v-stepper-item>
            <v-divider
              v-if="index !== visibleCategories.length - 1"
              :key="index"
            ></v-divider>
          </template>
        </v-stepper-header>

        <v-stepper-window>
          <v-stepper-window-item
            v-for="(element, index) in visibleCategories"
            :value="index + 1"
          >
            <v-card elevation="0">
              <dispatch-renderer
                :schema="layout.schema"
                :uischema="element"
                :path="layout.path"
                :enabled="layout.enabled"
                :renderers="layout.renderers"
                :cells="layout.cells"
              />
            </v-card>
          </v-stepper-window-item>
        </v-stepper-window>

        <v-stepper-actions
          v-if="appliedOptions.showNavButtons"
          @click:next="next"
          @click:prev="prev"
        ></v-stepper-actions>
      </template>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  and,
  uiTypeIs,
  Categorization,
  Category,
  optionIs,
  Tester,
  isVisible,
  categorizationHasCategory,
  deriveLabelForUISchemaElement,
} from '@jsonforms/core';
import { defineComponent, ref } from 'vue';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
} from '@jsonforms/vue';
import { useAjv, useTranslator, useVuetifyLayout } from '../util';
import {
  VStepper,
  VStepperHeader,
  VStepperItem,
  VDivider,
  VStepperWindowItem,
  VStepperWindow,
  VStepperActions,
  VSpacer,
  VCard,
  VCardActions,
  VBtn,
} from 'vuetify/components';
import {
  VStepperVertical,
  VStepperVerticalItem,
  VStepperVerticalActions,
} from 'vuetify/labs/VStepperVertical';

const layoutRenderer = defineComponent({
  name: 'categorization-stepper-renderer',
  components: {
    DispatchRenderer,
    VStepperVertical,
    VStepperVerticalItem,
    VStepperVerticalActions,
    VStepper,
    VStepperHeader,
    VStepperItem,
    VDivider,
    VSpacer,
    VStepperWindowItem,
    VStepperWindow,
    VStepperActions,
    VCard,
    VCardActions,
    VBtn,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const activeCategory = ref(1);
    const ajv = useAjv();
    const t = useTranslator();

    return {
      ...useVuetifyLayout(useJsonFormsLayout(props)),
      activeCategory,
      ajv,
      t,
    };
  },
  computed: {
    visibleCategories(): (Category | Categorization)[] {
      return (this.layout.uischema as Categorization).elements.filter(
        (category: Category | Categorization) =>
          isVisible(category, this.layout.data, this.layout.path, this.ajv),
      );
    },
    visibleCategoryLabels(): string[] {
      return this.visibleCategories.map((element) => {
        return deriveLabelForUISchemaElement(element, this.t) ?? '';
      });
    },
  },
});

export default layoutRenderer;

export const categorizationStepperTester: Tester = and(
  uiTypeIs('Categorization'),
  categorizationHasCategory,
  optionIs('variant', 'stepper'),
);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(3, categorizationStepperTester),
};
</script>
