<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      rounded
      height="6"
    ></v-progress-linear>
    <v-alert outlined type="error" text v-else-if="error !== undefined">
      <strong>Unable to load vuetify-json-forms webcomponent</strong><br />
    </v-alert>
    <vuetify-json-forms
      v-else
      v-bind="$attrs"
      v-on="$listeners"
    ></vuetify-json-forms>
  </div>
</template>

<script lang="ts">
export default {
  name: 'vuetify-json-forms-wrapper',
  data() {
    return {
      location: './js/vuetify-json-forms.min.js',
      loading: true,
      error: undefined,
    };
  },
  methods: {
    loadVuetifyJsonForms() {
      this.$loadScript(this.location)
        .then(() => {
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.error = error;
        });
    },
  },
  mounted() {
    this.loadVuetifyJsonForms();
  },
};
</script>
