export { default as LabelRenderer } from './LabelRenderer.vue';
export { default as ListWithDetailRenderer } from './ListWithDetailRenderer.vue';
export { default as TemplateLabelRenderer } from './TemplateLabelRenderer.vue';

import { entry as labelRendererEntry } from './LabelRenderer.vue';
import { entry as listWithDetailRendererEntry } from './ListWithDetailRenderer.vue';
import { entry as templateLabelRendererEntry } from './TemplateLabelRenderer.vue';

export const additionalRenderers = [
  labelRendererEntry,
  listWithDetailRendererEntry,
  templateLabelRendererEntry,
];
