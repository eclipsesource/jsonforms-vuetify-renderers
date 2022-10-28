import { AsyncComponent, Component, ref } from 'vue';
import { CompiledResultFunctions } from 'vue-template-compiler';

export type Components = {
  [key: string]:
    | Component<any, any, any, any>
    | AsyncComponent<any, any, any, any>;
};

export type CompileFunction = Promise<
  (template: string) => CompiledResultFunctions
>;

export const compileToFunctions = ref<
  ((template: string) => CompiledResultFunctions) | null
>(null);
