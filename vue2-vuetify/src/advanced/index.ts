export { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';

import { CompileFunction, compileToFunctions } from './types';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.vue';

const renderers = [templateLayoutRendererEntry];

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
