import { JsonExampleInput } from '@/core/types';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: JsonExampleInput = { schema, uischema, data, i18n };
