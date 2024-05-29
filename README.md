# JSON Forms Vuetify renderers

This is a monorepo containing the JSON Forms Vue 3 Vuetify renderers and an example application.

See [jsonforms-vuetify-renderers.netlify.app](https://jsonforms-vuetify-renderers.netlify.app) for the deployed example application.

## JSON Forms

See [jsonforms.io](https://jsonforms.io/) and the [main repository](https://github.com/eclipsesource/jsonforms) for more information about JSON Forms.

## Vue3 Vuetify renderer set

See the [README](https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/README.md) of the Vue 2 Vuetify renderer set for detailed instructions on how to consume and use the JSON Forms Vue 2 Vuetify renderer set.

## Developer documentation

Use Node v18.19+

### Initial setup

- Install [node.js](https://nodejs.org/) (only Node v18.19+ < 19 is currently supported)
- Install pnpm: <https://pnpm.io/installation> (use pnpm 8.6.2+)
- Clone this repository
- Install dependencies: `pnpm i --frozen-lockfile`

### Scripts

- Build the renderer set: `pnpm run build`
- Build and watch the renderer set: `pnpm run watch`
- Remove build artifacts: `pnpm run clean`
- Run example app: `pnpm run example:dev`
- Build example app for production: `pnpm run example:build`
- Run Tests: `pnpm run test`
- Linting: `pnpm run lint`

Recommendations:

- For development use `pnpm run watch` combined with `pnpm run example:dev`.
- To test production use `pnpm run build` combined with `pnpm run example:build`.
  Then serve the built application from `example/dist` with a web server of your choice, e.g. `npx http-server example/dist` or use `pnpm run example:preview`
