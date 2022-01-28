<template>
  <v-card
    class="d-flex align-center justify-center pa-4 mx-auto"
    max-width="550"
    min-height="76"
    outlined
  >
    <div :class="`text-caption`">
      <draggable
        class="dragArea list-group"
        :list="list1"
        group="people"
        @change="handleChange"
      >
      </draggable>
      Drag and drop an element from the Palette to begin.
      <div class="list-group-item" v-for="element in list1" :key="element.type">
        {{ element.type }}
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
export default {
  name: 'EmptyEditor',
  components: {
    draggable,
  },
  data() {
    return {
      list1: [],
    };
  },
  methods: {
    handleChange(e: any) {
      if (e.added) {
        let provider = e.added.element.uiSchemaElementProvider();
        this.$store.set('app/editor@uiSchema', provider);
      }
    },
  },
};
</script>
