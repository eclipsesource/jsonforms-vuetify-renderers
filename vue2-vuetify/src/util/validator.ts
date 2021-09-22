import { Options } from 'ajv';
import { createAjv as createAjvCore } from '@jsonforms/core';

export const createAjv = (options?: Options) => {
    const ajv = createAjvCore(options);
    ajv.addFormat('password', (_) => true);
    return ajv;
};