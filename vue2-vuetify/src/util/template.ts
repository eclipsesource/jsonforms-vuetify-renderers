import templateFn from 'lodash/template';
import merge from 'lodash/merge';
import { TemplateExecutor, TemplateOptions } from 'lodash';

const interpolate = /{{([\s\S]+?)}}/g;

export const template = (
  templateString?: string,
  options?: TemplateOptions
): TemplateExecutor => {
  return templateFn(
    templateString,
    merge({ interpolate: interpolate }, options)
  );
};
