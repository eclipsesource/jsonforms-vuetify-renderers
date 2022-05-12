<template>
  <component :is="compiled" v-if="compiled">
    <template
      v-if="elements !== undefined && elements.length == 1"
      v-slot:default
    >
      <slot></slot>
    </template>

    <template v-for="(element, index) in elements" v-slot:[`${index}`]>
      <div :key="`${index}`">
        <slot :name="`${index}`"></slot>
      </div>
    </template>
  </component>
</template>

<script lang="ts">
import {
  CompiledResultFunctions,
  compileToFunctions,
} from 'vue-template-compiler';
import Vue from 'vue';
import {
  CompType,
  Components,
  defineComponent,
  ComputedOptions,
  MethodOptions,
} from '../../vue';
import { UISchemaElement } from '@jsonforms/core';
import merge from 'lodash/merge';

const templateCompiler = defineComponent({
  name: 'template-compiler',

  inheritAttrs: false,

  props: {
    parent: {
      type: Object as CompType<Vue, ObjectConstructor>,
      default: undefined,
    },

    template: {
      type: String,
      default: '<div></div>',
    },

    componentComputed: {
      type: Object as CompType<ComputedOptions, ObjectConstructor>,
      default: undefined,
    },

    componentMethods: {
      type: Object as CompType<MethodOptions, ObjectConstructor>,
      default: undefined,
    },

    componentFilters: {
      type: Object as CompType<MethodOptions, ObjectConstructor>,
      default: undefined,
    },

    componentComponents: {
      type: Object as CompType<Components, ObjectConstructor>,
      default: undefined,
    },

    elements: {
      type: Array as CompType<UISchemaElement[], ArrayConstructor>,
      default: undefined,
    },
  },

  data() {
    return {
      isCompiling: false,
      compiled: null as CompiledResultFunctions | null,
    };
  },

  computed: {
    componentProps() {
      const data = [
        this.parentData,
        this.parentProps,
        (this.parentComponent as any)._provided,
      ];
      const computed: any = this.componentComputed || {};
      const methods: any = this.componentMethods || {};
      const filters: any = this.componentFilters || {};
      const components: any = this.componentComponents || {};
      return {
        components: components,
        computed: computed,
        filters: filters,
        methods: methods,
        data: () => merge({}, ...data),
      };
    },

    parentComponent(): Vue {
      return (this.parent as Vue) || this.$parent;
    },

    parentData() {
      return (this.parentComponent as any as Vue).$data || {};
    },

    parentProps() {
      return (this.parentComponent as any as Vue).$props || {};
    },
  },

  beforeMount() {
    this.compile();
  },

  methods: {
    compile() {
      const component = compileToFunctions(this.template);
      this.compiled = merge(component, this.componentProps);
    },
  },
});

export default templateCompiler;
</script>
