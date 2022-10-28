import { additionalRenderers } from './additional';
import { advancedRenderers, CompileFunction } from './advanced';
import { arrayRenderers } from './array';
import { complexRenderers } from './complex';
import { controlRenderers } from './controls';
import { extendedRenderers } from './extended';
import { layoutRenderers } from './layouts';

export const vuetifyRenderers = [
  ...additionalRenderers,
  ...arrayRenderers,
  ...complexRenderers,
  ...controlRenderers,
  ...layoutRenderers,
];

export const extendedVuetifyRenderers = [
  ...extendedRenderers,
  ...vuetifyRenderers,
];

export const advancedVuetifyRenderers = (compile: () => CompileFunction) => [
  ...advancedRenderers(compile),
  ...extendedVuetifyRenderers,
];
