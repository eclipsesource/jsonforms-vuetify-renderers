<template>
  <array-layout-renderer v-bind="$props">
    <template v-slot:toolbar-elements>{{ null }}</template>
    <template v-slot:actions="{ control, addClick, addDisabled, addClass }">
      <v-tooltip bottom>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            rounded
            :aria-label="control.translations.addTooltip"
            v-bind="props"
            :class="addClass"
            :disabled="addDisabled"
            @click="addClick"
          >
            <v-icon>mdi-plus</v-icon> {{ control.translations.addTooltip }}
          </v-btn>
        </template>
        {{ control.translations.addTooltip }}
      </v-tooltip>
    </template>
  </array-layout-renderer>
</template>

<script lang="ts">
import {
  type ControlElement,
  type JsonFormsRendererRegistryEntry,
  withIncreasedRank,
} from '@jsonforms/core';
import { rendererProps } from '@jsonforms/vue';
import {
  ArrayLayoutRenderer,
  arrayLayoutRendererEntry,
} from '@jsonforms/vue-vuetify';
import { VTooltip, VIcon, VBtn } from 'vuetify/components';
import { defineComponent } from 'vue';

const controlRenderer = defineComponent({
  name: 'custom-array-renderer',
  components: {
    ArrayLayoutRenderer,
    VTooltip,
    VIcon,
    VBtn,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: withIncreasedRank(1, arrayLayoutRendererEntry.tester),
};
</script>
