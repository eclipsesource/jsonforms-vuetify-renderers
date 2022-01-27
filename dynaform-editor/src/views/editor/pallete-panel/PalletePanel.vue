<template>
  <!-- <v-main> -->
  <v-container fill-height fluid>
    <v-tabs>
      <v-tabs-slider></v-tabs-slider>
      <v-tab class="primary--text">Palete </v-tab>

      <v-tab class="primary--text"> JSON Schema </v-tab>
      <v-tab class="primary--text"> UI Schema </v-tab>

      <v-tab-item>
        <draggable
          class="dragArea list-group"
          :list="paletteElements"
          :group="{ name: 'people', pull: 'clone', put: false }"
          :sort="false"
        >
          <div v-for="element in paletteElements" :key="element.type">
            <v-icon v-text="element.icon"></v-icon>

            <span v-text="element.label"></span>
          </div>
        </draggable>
        <h4>Controls</h4>
        <draggable
          class="dragArea list-group"
          :list="getChildrenToRender(schema)"
          :group="{ name: 'people', pull: 'clone', put: false }"
          :sort="false"
        >
          <div
            v-for="element in getChildrenToRender(schema)"
            :key="element.uuid"
          >
            <span v-text="getLabel(element)"></span>
          </div>
        </draggable>
      </v-tab-item>
      <v-tab-item> </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import { sync } from 'vuex-pathify';
import {
  getChildren,
  getLabel,
  getPath,
  isArrayElement,
  isObjectElement,
  SchemaElement,
} from '../../../model/schema';

export default {
  name: 'PalletePanel',
  components: {
    draggable,
  },
  props: {
    schema: {
      type: Object,
    },
  },
  data() {
    return {
      tabs: [],
      list1: [
        { name: 'John', id: 1 },
        { name: 'Joao', id: 2 },
        { name: 'Jean', id: 3 },
        { name: 'Gerard', id: 4 },
      ],
    };
  },
  created: function () {
    this.$store.dispatch('app/getPaletteElements');
  },
  computed: {
    paletteElements: sync('app/editor@paletteElements'),
    editorSchema: sync('app/editor@schema'),
  },

  methods: {
    getChildrenToRender: function (schemaElement: SchemaElement) {
      return schemaElement ? getChildren(schemaElement).flatMap((child) => {
        // if the child is the only item of an array, use its children instead
        if (
          isObjectElement(child) &&
          isArrayElement(child.parent) &&
          child.parent.items === child
        ) {
          return getChildren(child);
        }
        return [child];
      }): [];
    },
    getLabel: function (schemaElement: SchemaElement) {
      return getLabel(schemaElement);
    },
  },
};
</script>
