<template>
  <v-container
    v-if="control.visible"
    fill-height
    :class="styles.listWithDetail.root"
  >
    <v-row>
      <v-col class="pa-0">
        <v-toolbar flat :class="styles.listWithDetail.toolbar">
          <v-toolbar-title :class="styles.listWithDetail.label">{{
            computedLabel
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <validation-icon
            v-if="control.childErrors.length > 0"
            :errors="control.childErrors"
          />
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                fab
                variant="text"
                elevation="0"
                small
                :aria-label="`Add to ${control.label}`"
                v-bind="props"
                :class="styles.listWithDetail.addButton"
                @click="addButtonClick"
                :disabled="
                  !control.enabled ||
                  (appliedOptions.restrict &&
                    arraySchema !== undefined &&
                    arraySchema.maxItems !== undefined &&
                    dataLength >= arraySchema.maxItems)
                "
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>

            {{
              t('Add to ${controlLabel}', 'Add to ${controlLabel}', {
                controlLabel: control.label,
              })
            }}
          </v-tooltip>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row v-if="dataLength === 0" :class="styles.listWithDetail.noData">
      <v-col>
        {{ t('No data', 'No data') }}
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col class="flex-shrink-1 flex-grow-0 pa-0">
        <v-list v-model:selected="selectedIndex">
          <v-virtual-scroll
            :items="control.data"
            :item-height="64"
            bench="4"
            :min-height="`${4 * 64}`"
            :max-height="`${6 * 64}`"
            :min-width="appliedOptions.showSortButtons ? 350 : 250"
            max-width="350"
          >
            <template v-slot="{ index }">
              <v-list-item
                dense
                :value="index"
                :class="styles.listWithDetail.item"
              >
                <template v-slot:prepend="{ isSelected }">
                  <validation-badge
                    overlap
                    bordered
                    :errors="childErrors(index)"
                    style="margin-right: 8px"
                  >
                    <v-avatar
                      size="40"
                      aria-label="Index"
                      :color="isSelected ? 'primary' : undefined"
                      ><span>{{ index + 1 }}</span></v-avatar
                    >
                  </validation-badge>
                </template>
                <v-list-item-title>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <span
                        v-bind="props"
                        :class="styles.listWithDetail.itemLabel"
                      >
                        {{ childLabelForIndex(index) }}</span
                      >
                    </template>
                    {{ childLabelForIndex(index) }}
                  </v-tooltip>
                </v-list-item-title>
                <template v-slot:append>
                  <v-tooltip bottom v-if="appliedOptions.showSortButtons">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        fab
                        variant="text"
                        elevation="0"
                        small
                        class="ma-0"
                        aria-label="Move up"
                        :disabled="index <= 0 || !control.enabled"
                        :class="styles.listWithDetail.itemMoveUp"
                        @click.native="moveUpClick($event, index)"
                      >
                        <v-icon class="notranslate">mdi-arrow-up</v-icon>
                      </v-btn>
                    </template>
                    {{ t('Move Up', 'Move Up') }}
                  </v-tooltip>
                  <v-tooltip bottom v-if="appliedOptions.showSortButtons">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        fab
                        variant="text"
                        elevation="0"
                        small
                        class="ma-0"
                        aria-label="Move down"
                        :disabled="index >= dataLength - 1 || !control.enabled"
                        :class="styles.listWithDetail.itemMoveDown"
                        @click.native="moveDownClick($event, index)"
                      >
                        <v-icon class="notranslate">mdi-arrow-down</v-icon>
                      </v-btn>
                    </template>
                    {{ t('Move Down', 'Move Down') }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        fab
                        variant="text"
                        elevation="0"
                        small
                        class="ma-0"
                        aria-label="Delete"
                        :class="styles.listWithDetail.itemDelete"
                        @click.native="removeItemsClick($event, [index])"
                        :disabled="
                          !control.enabled ||
                          (appliedOptions.restrict &&
                            arraySchema !== undefined &&
                            arraySchema.minItems !== undefined &&
                            dataLength <= arraySchema.minItems)
                        "
                      >
                        <v-icon class="notranslate">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    {{ t('Delete', 'Delete') }}
                  </v-tooltip>
                </template>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-list>
      </v-col>
      <v-col v-if="selectedIndex === undefined" class="flex-grow-1">
        <span class="text-h6">{{ t('No Selection', 'No Selection') }}</span>
      </v-col>
      <v-col
        v-else
        :class="`flex-shrink-0 flex-grow-1 ${styles.listWithDetail.itemContent}`"
      >
        <dispatch-renderer
          :schema="control.schema"
          :uischema="foundUISchema"
          :path="composePaths(control.path, `${selectedIndex}`)"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  ControlElement,
  rankWith,
  composePaths,
  createDefaultValue,
  and,
  uiTypeIs,
  isObjectArray,
  findUISchema,
  UISchemaElement,
  Resolve,
  JsonSchema,
} from '@jsonforms/core';
import { defineComponent, ref } from 'vue';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsArrayControl,
} from '@jsonforms/vue';
import { useTranslator, useVuetifyArrayControl } from '../util';
import {
  VList,
  VListItem,
  VListItemTitle,
  VListItemAction,
  VRow,
  VCol,
  VContainer,
  VToolbar,
  VToolbarTitle,
  VTooltip,
  VIcon,
  VBtn,
  VAvatar,
  VSpacer,
  VExpansionPanels,
  VExpansionPanel,
  VExpansionPanelTitle,
  VExpansionPanelText,
  VVirtualScroll,
} from 'vuetify/components';
import { ValidationIcon, ValidationBadge } from '../controls/components/index';
import { ErrorObject } from 'ajv';

const controlRenderer = defineComponent({
  name: 'list-with-detail-renderer',
  components: {
    DispatchRenderer,
    VList,
    VListItem,
    VListItemTitle,
    VListItemAction,
    VAvatar,
    VRow,
    VCol,
    VToolbar,
    VToolbarTitle,
    VTooltip,
    VBtn,
    VIcon,
    VSpacer,
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelTitle,
    VExpansionPanelText,
    VContainer,
    VVirtualScroll,
    ValidationIcon,
    ValidationBadge,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const selectedIndex = ref<number | undefined>(undefined);
    const t = useTranslator();

    return {
      ...useVuetifyArrayControl(useJsonFormsArrayControl(props)),
      selectedIndex,
      t,
    };
  },
  computed: {
    dataLength(): number {
      return this.control.data ? this.control.data.length : 0;
    },
    foundUISchema(): UISchemaElement {
      return findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        undefined,
        this.control.uischema,
      );
    },
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
        this.control.rootSchema,
        this.control.uischema.scope,
        this.control.rootSchema,
      );
    },
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema, this.control.rootSchema),
      )();
    },
    moveUpClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveUp?.(this.control.path, toMove)();
    },
    moveDownClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveDown?.(this.control.path, toMove)();
    },
    removeItemsClick(event: Event, toDelete: number[]): void {
      event.stopPropagation();
      this.removeItems?.(this.control.path, toDelete)();
    },
    childErrors(index: number): ErrorObject[] {
      return this.control.childErrors.filter((e) =>
        e.instancePath.startsWith(
          this.composePaths(this.control.path, `${index}`),
        ),
      );
    },
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(uiTypeIs('ListWithDetail'), isObjectArray)),
};
</script>

<style scoped>
.notranslate {
  transform: none !important;
}
</style>
