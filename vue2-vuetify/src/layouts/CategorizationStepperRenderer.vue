<template>
  <div v-if="layout.visible" :class="styles.categorization.root">
    <v-stepper
      v-if="appliedOptions.vertical === true"
      v-model="activeCategory"
      vertical
      v-bind="vuetifyProps('v-stepper')"
    >
      <template v-for="(element, index) in visibleCategories">
        <v-stepper-step
          :key="`${layout.path}-${index}`"
          :step="index + 1"
          editable
          v-bind="vuetifyProps('v-stepper-step')"
        >
          {{ visibleCategoryLabels[index] }}
        </v-stepper-step>

        <v-stepper-content
          :key="`${layout.path}-${index}`"
          :step="index + 1"
          v-bind="vuetifyProps('v-stepper-content')"
        >
          <v-card v-bind="vuetifyProps('v-card')">
            <dispatch-renderer
              :schema="layout.schema"
              :uischema="element"
              :path="layout.path"
              :enabled="layout.enabled"
              :renderers="layout.renderers"
              :cells="layout.cells"
            />

            <div v-if="!!appliedOptions.showNavButtons">
              <v-divider></v-divider>

              <v-card-actions v-bind="vuetifyProps('v-card-actions')">
                <v-btn
                  text
                  left
                  :disabled="activeCategory - 1 <= 0"
                  @click="activeCategory--"
                  v-bind="vuetifyProps('v-btn.back')"
                >
                  {{
                    translateByText(
                      vuetifyProps('v-btn.back', { label: 'Back' }).label
                    )
                  }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  right
                  :disabled="activeCategory - 1 >= visibleCategories.length - 1"
                  @click="activeCategory++"
                  v-bind="vuetifyProps('v-btn.next', { color: 'primary' })"
                >
                  {{
                    translateByText(
                      vuetifyProps('v-btn.next', { label: 'Next' }).label
                    )
                  }}
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-stepper-content>
      </template>
    </v-stepper>
    <v-stepper
      v-else
      v-model="activeCategory"
      v-bind="vuetifyProps('v-stepper')"
    >
      <v-stepper-header v-bind="vuetifyProps('v-stepper-header')">
        <template v-for="(_, index) in visibleCategories">
          <v-stepper-step
            :key="`${layout.path}-${index}`"
            :step="index + 1"
            editable
            v-bind="vuetifyProps('v-stepper-step')"
          >
            {{ visibleCategoryLabels[index] }}
          </v-stepper-step>
          <v-divider
            v-if="index !== visibleCategories.length - 1"
            :key="index"
          ></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-items v-bind="vuetifyProps('v-stepper-items')">
        <v-stepper-content
          v-for="(element, index) in visibleCategories"
          :key="`${layout.path}-${index}`"
          :step="index + 1"
          v-bind="vuetifyProps('v-stepper-content')"
        >
          <v-card v-bind="vuetifyProps('v-card')">
            <dispatch-renderer
              :schema="layout.schema"
              :uischema="element"
              :path="layout.path"
              :enabled="layout.enabled"
              :renderers="layout.renderers"
              :cells="layout.cells"
            />

            <div v-if="!!appliedOptions.showNavButtons">
              <v-divider></v-divider>

              <v-card-actions v-bind="vuetifyProps('v-card-actions')">
                <v-btn
                  text
                  left
                  :disabled="activeCategory - 1 <= 0"
                  @click="activeCategory--"
                  v-bind="vuetifyProps('v-btn.back')"
                >
                  {{
                    translateByText(
                      vuetifyProps('v-btn.back', { label: 'Back' }).label
                    )
                  }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  right
                  :disabled="activeCategory - 1 >= visibleCategories.length - 1"
                  @click="activeCategory++"
                  v-bind="
                    vuetifyProps('v-btn.next', { color: 'primary', text: true })
                  "
                >
                  {{
                    translateByText(
                      vuetifyProps('v-btn.next', { label: 'Next' }).label
                    )
                  }}
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
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
} from '@jsonforms/vue2';
import { useAjv, useTranslator, useVuetifyLayout } from '../util';
import {
  VStepper,
  VStepperHeader,
  VStepperStep,
  VDivider,
  VStepperItems,
  VStepperContent,
  VSpacer,
  VCard,
  VCardActions,
  VBtn,
} from 'vuetify/lib';

const layoutRenderer = defineComponent({
  name: 'categorization-stepper-renderer',
  components: {
    DispatchRenderer,
    VStepper,
    VStepperHeader,
    VStepperStep,
    VDivider,
    VSpacer,
    VStepperItems,
    VStepperContent,
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
          isVisible(category, this.layout.data, this.layout.path, this.ajv)
      );
    },
    visibleCategoryLabels(): string[] {
      return this.visibleCategories.map((element) => {
        return deriveLabelForUISchemaElement(element, this.t) ?? '';
      });
    },
  },
  methods: {
    translateByText(text: string): string {
      return this.t(text, text);
    },
  },
});

export default layoutRenderer;

export const categorizationStepperTester: Tester = and(
  uiTypeIs('Categorization'),
  categorizationHasCategory,
  optionIs('variant', 'stepper')
);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(3, categorizationStepperTester),
};
</script>
