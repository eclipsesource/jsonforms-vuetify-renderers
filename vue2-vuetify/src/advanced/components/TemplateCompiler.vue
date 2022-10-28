<template>
  <component :is="compiled" v-if="compiled">
    <template
      v-if="elements !== undefined && elements.length == 1"
      v-slot:default
    >
      <slot></slot>
    </template>

    <template v-for="(_element, index) in elements" v-slot:[`${index}`]>
      <div :key="`${index}`">
        <slot :name="`${index}`"></slot>
      </div>
    </template>
  </component>
</template>

<script lang="ts">
import { UISchemaElement } from '@jsonforms/core';
import merge from 'lodash/merge';
import Vue, { defineComponent, PropType, unref } from 'vue';
import { CompiledResultFunctions } from 'vue-template-compiler';
import { DirectiveFunction, DirectiveOptions } from 'vue/types/umd';
import { ComputedOptions, MethodOptions } from 'vue/types/v3-component-options';
import { compileToFunctions, Components } from '../compile';

const templateCompiler = defineComponent({
  name: 'template-compiler',

  inheritAttrs: false,

  props: {
    parent: {
      type: [Object] as PropType<Vue>,
    },

    template: {
      type: String,
      default: '<div></div>',
    },

    componentDirectives: {
      type: [Object] as PropType<
        Record<string, DirectiveFunction | DirectiveOptions>
      >,
    },

    componentComputed: {
      type: [Object] as PropType<ComputedOptions>,
    },

    componentMethods: {
      type: [Object] as PropType<MethodOptions>,
    },

    componentFilters: {
      type: [Object] as PropType<MethodOptions>,
    },

    componentComponents: {
      type: [Object] as PropType<Components>,
    },

    elements: {
      type: [Array] as PropType<UISchemaElement[]>,
    },
  },

  data() {
    return {
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
      const directives: any = this.componentDirectives || {};
      const methods: any = this.componentMethods || {};
      const filters: any = this.componentFilters || {};
      const components: any = this.componentComponents || {};
      return {
        components: components,
        directives: directives,
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
  async created() {
    await this.compile();
  },
  methods: {
    async compile() {
      const component = compileToFunctions.value!(this.template);
      const compiled = merge(component, unref(this.componentProps));
      this.compiled = compiled;
    },
  },
});

export default templateCompiler;
</script>
