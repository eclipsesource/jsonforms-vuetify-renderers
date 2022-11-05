# JSON Forms Vuetify renderers

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
- Run Vuetify JsonForms Web Component: `npm run wc:serve`
- Build Vuetify JsonForms Web Component for production: `npm run wc:build`

Recommendations:

- For development use `npm run watch` combined with `npm run example:serve`.
- To test production use `npm run build` followed by `npm run wc:build` combined with `npm run example:build`.
  Then serve the built application from `example/dist` with a web server of your choice, e.g. `npx http-server example/dist`.
