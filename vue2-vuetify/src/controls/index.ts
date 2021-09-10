export { default as ControlRenderer } from './ControlRenderer.vue';
import { entry as controlRendererEntry } from './ControlRenderer.vue';

export { default as integerControlRenderer } from './IntegerControlRenderer.vue';
import { entry as integerControlRendererEntry } from './IntegerControlRenderer.vue';

export { default as booleanControlRenderer } from './BooleanControlRenderer.vue';
import { entry as booleanControlRendererEntry } from './BooleanControlRenderer.vue';

export { default as dateControlRenderer } from './DateControlRenderer.vue';
import { entry as dateControlRendererEntry } from './DateControlRenderer.vue';

export { default as ObjectControlRenderer } from './ObjectControlRenderer.vue';
import { entry as objectControlRendererEntry } from './ObjectControlRenderer.vue';

export const controlRenderers = [
  controlRendererEntry,
  integerControlRendererEntry,
  booleanControlRendererEntry,
  dateControlRendererEntry,
  objectControlRendererEntry,
];
