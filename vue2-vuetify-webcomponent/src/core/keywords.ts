import keywords from 'ajv-keywords';
import dynamicDefaults from 'ajv-keywords/dist/definitions/dynamicDefaults';
import Ajv from 'ajv';
import tranform from './transform';

import {
  searchParams,
  datetimeOffset,
  dateOffset,
  timeOffset,
} from './dynamicDefaults';

export const ajvKeywords = (ajv: Ajv) => {
  keywords(ajv);

  // add custom transform to be able to use more transformation functions since the transform keyword is not extensible as the dynamicDefaults
  ajv.removeKeyword('transform');
  ajv.addKeyword(tranform());

  // register new dynamic defaults
  (dynamicDefaults.DEFAULTS as any).searchParams = searchParams;
  (dynamicDefaults.DEFAULTS as any).datetime = datetimeOffset;
  (dynamicDefaults.DEFAULTS as any).date = dateOffset;
  (dynamicDefaults.DEFAULTS as any).time = timeOffset;
};
