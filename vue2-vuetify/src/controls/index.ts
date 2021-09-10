export { default as ControlRenderer } from './ControlRenderer.vue';
import { entry as controlRendererEntry } from './ControlRenderer.vue';

export { default as ObjectControlRenderer } from './ObjectControlRenderer.vue';
import { entry as objectControlRendererEntry } from './ObjectControlRenderer.vue';

export const controlRenderers = [controlRendererEntry, objectControlRendererEntry];
