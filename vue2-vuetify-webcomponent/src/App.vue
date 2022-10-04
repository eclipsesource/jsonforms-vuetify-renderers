<template>
  <vuetify-json-forms
    :schema="JSON.stringify(schema)"
    :uischema="JSON.stringify(uischema)"
    :data="JSON.stringify(data)"
    :config="JSON.stringify(config)"
    :default-preset="JSON.stringify(preset)"
    :uischemas="JSON.stringify(uischemas)"
    :locale="locale"
    :translations="JSON.stringify(i18n)"
    @change="onChange"
  >
    <!-- emulate the css since the VuetifyJsonForms are not build as actual web component that includes css during npm run serve -->
    <custom-style slot="style" type="text/css">
      @import
      url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');
      @import
      url('https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/6.5.95/css/materialdesignicons.min.css');
      @import
      url("https://cdnjs.cloudflare.com/ajax/libs/vuetify/2.6.3/vuetify.min.css");
    </custom-style>
  </vuetify-json-forms>
</template>

<script lang="ts">
import wrap from '@vue/web-component-wrapper';
import Vue, { defineComponent } from 'vue';
import { onChange as externalOnChange } from './example/actions';
import config from './example/config.json';
import data from './example/data.json';
import i18n from './example/i18n.json';
import preset from './example/preset.json';
import schema from './example/schema.json';
import uischema from './example/uischema.json';
import uischemas from './example/uischemas.json';

import VuetifyJsonForms from './web-components/VuetifyJsonForms.vue';

const VuetifyJsonFormsElement = wrap(Vue, VuetifyJsonForms);

window.customElements.define(
  'vuetify-json-forms',
  VuetifyJsonFormsElement as any
);

const CustomStyle = defineComponent({
  name: 'custom-style',
  render(createElement) {
    return createElement('style', this.$slots.default);
  },
});

export default defineComponent({
  name: 'App',
  components: {
    CustomStyle,
  },
  data() {
    return {
      data,
      schema,
      uischema,
      uischemas,
      preset,
      config,
      i18n,
      locale: 'en',
    };
  },
  methods: {
    onChange(customEvent: any): void {
      externalOnChange(customEvent);
    },
  },
});
</script>
