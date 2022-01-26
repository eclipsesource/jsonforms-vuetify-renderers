<template>
  <!-- <v-main> -->
  <v-container fill-height fluid>
    <v-tabs>
      <v-tabs-slider></v-tabs-slider>
      <v-tab class="primary--text">Palete </v-tab>

      <v-tab class="primary--text"> JSON Schema </v-tab>
      <v-tab class="primary--text"> UI Schema </v-tab>

      <!-- <v-tab href="#mobile-tabs-5-3" class="primary--text">
        <v-icon>mdi-account-box</v-icon>
      </v-tab> -->
      <!-- </v-tabs> -->

      <!-- <v-tabs-items v-model="tabs"> -->
      <v-tab-item>
        <draggable
          class="dragArea list-group"
          :list="paletteElements"
          :group="{ name: 'people', pull: 'clone', put: false }"
          :sort="false"
        >
          <!-- <div
            class="list-group-item"
            v-for="element in paletteElements"
            :key="element.type"
          >
            {{ element.label }}
          </div> -->
          <div v-for="element in paletteElements" :key="element.type">
            <v-icon v-text="element.icon"></v-icon>

            <span v-text="element.label"></span>
          </div>
        </draggable>
      </v-tab-item>
      <v-tab-item>
        <!-- <v-card flat>
          <v-card-text v-text="text"></v-card-text>
        </v-card> -->
      </v-tab-item>
    </v-tabs>
    <!-- </v-tabs-items> -->
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
  mounted: function () {
    this.$store.dispatch('app/getPaletteElements');
    console.log('palete schema');
    
    // console.log(this.getChildrenToRender(this.schema));
  },
  computed: {
    paletteElements: sync('app/editor@paletteElements'),
  },
  methods: {
    getChildrenToRender: function (schemaElement: SchemaElement) {
      getChildren(schemaElement).flatMap((child) => {
        // if the child is the only item of an array, use its children instead
        if (
          isObjectElement(child) &&
          isArrayElement(child.parent) &&
          child.parent.items === child
        ) {
          return getChildren(child);
        }
        return [child];
      });
    },
    log: function (evt) {
      // window.console.log(evt);
    },
    handleChange: function (e) {
      console.log(e);
    },
    start: function (e, item) {
      console.log('start');
      console.log(item);
    },
  },
};
</script>
