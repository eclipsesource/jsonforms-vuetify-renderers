<template>
  <v-card outlined>
    <v-row @mouseover="hover = true" @mouseleave="hover = false">
      <v-col>
        <Icon :type="wrappedElement.type" />
      </v-col>
      <v-col>
        <v-btn
          class="mx-2"
          fab
          right
          absolute
          x-small
          v-if="hover"
          @click="onClick"
        >
          <v-icon dark> mdi-delete </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <slot></slot>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { PropType } from 'vue';
import {
  EditorUISchemaElement,
  getUISchemaPath,
  hasChildren,
} from '../model/uischema';
import Icon from './Icon.vue';
export default {
  name: 'EditorElement',
  props: {
    wrappedElement: {
      required: false,
      type: Object as PropType<EditorUISchemaElement>,
    },
  },
  components: {
    Icon,
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {
    onClick: function () {
      if (!hasChildren(this.wrappedElement)) {
        this.$store.dispatch(
          'app/removeUiSchemaElement',
          this.wrappedElement.uuid
        );
      }
      // ? setOpenConfirmRemoveDialog(true)
      // : dispatch(Actions.removeUiSchemaElement(wrappedElement.uuid));
    },
  },
};
</script>
