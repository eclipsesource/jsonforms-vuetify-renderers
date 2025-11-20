# JSON Forms Vuetify renderers

> [!CAUTION]
> This repository is no longer maintained.
> JSON Forms no longer supports Vue 2 since June 2023.<br/><br/>
> The last version of JSON Forms supporting Vue 2 is `3.1.0` with `@jsonforms/vue2-vuetify` in version `3.1.0-alpha.3`.<br/>
> The last stable version of `@jsonforms/vue2-vuetify` is `3.0.0` which needs to be combined with JSON Forms `3.0.0`<br/><br/>
> Since then the Vue 2 Vuetify renderers were ported to Vue 3 and are now located in the [main repository](https://github.com/eclipsesource/jsonforms).<br/>
> See [jsonforms.io](https://jsonforms.io) for more information about JSON Forms.

This is a monorepo containing the JSON Forms Vue 2 Vuetify renderers and an example application.

See [jsonforms-vuetify-renderers.netlify.app](https://jsonforms-vuetify-renderers.netlify.app) for the deployed example application.

## JSON Forms

See [jsonforms.io](https://jsonforms.io/) and the [main repository](https://github.com/eclipsesource/jsonforms) for more information about JSON Forms.

## Vue2 Vuetify renderer set

See the [README](https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/README.md) of the Vue 2 Vuetify renderer set for detailed instructions on how to consume and use the JSON Forms Vue 2 Vuetify renderer set.

## Developer documentation

Use Node 12+

### Initial setup

- Install monorepo dependencies: `npm ci`
- Hook up dependencies between packages: `npm run init`

### Scripts

- Build the renderer set: `npm run build`
- Build and watch the renderer set: `npm run watch`
- Remove build artifacts: `npm run clean`
- Run example app: `npm run example:serve`
- Build example app for production: `npm run example:build`

Recommendations:

- For development use `npm run watch` combined with `npm run example:serve`.
- To test production use `npm run build` combined with `npm run example:build`.
  Then serve the built application from `example/dist` with a web server of your choice, e.g. `npx http-server example/dist`.

### Use with Vite

When building for production with Vite, custom renderers will not work correctly if their entries are defined within the Single File Component - ie within the custom renderer itself.

To use custom renderers with Vite in production mode, define the entry for any custom renderer outside of the SFC that defines the renderer itself. For example, within the file that imports and registers the renderer. Example repo: https://github.com/yaffol/json-forms-vuetify-vite-seed

See also https://github.com/eclipsesource/jsonforms/issues/2077 and https://jsonforms.discourse.group/t/custom-renderers-not-rendering/1250
