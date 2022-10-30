export { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';
export { default as TemplateRenderer } from './TemplateRenderer.vue';
export { default as SlotRenderer } from './SlotRenderer.vue';

import { CompileFunction, compileToFunctions } from './types';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.vue';
import { entry as templateRendererEntry } from './TemplateRenderer.vue';
import { entry as slotRendererEntry } from './SlotRenderer.vue';

const renderers = [
  templateLayoutRendererEntry,
  templateRendererEntry,
  slotRendererEntry,
];

// async load of compiler to enable code split
// const compileToFunctions = () =>
//   import('vue-template-compiler').then((module) => {
//     const { compileToFunctions } = module;
//     return compileToFunctions;
//   });
// advancedRenderers(compileToFunctions);

export const advancedRenderers = (compile: () => CompileFunction) => {
  compile().then((compileFn) => {
    compileToFunctions.value = compileFn;
  });

  return renderers;
};

export * from './types';
