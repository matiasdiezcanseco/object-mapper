import _ from 'lodash';

import { z, ZodType } from 'zod';
import type { $ZodIssue } from '@zod/core';

type PathMapping<T, R = T> = {
  path: string;
  default?: T;
  transform?: (value: T) => R;
};

type Mappings = {
  [key: string]: PathMapping<any, any>;
};

type ExtractedValues<M extends Mappings> = {
  [K in keyof M]: M[K] extends PathMapping<infer T, infer R> ? R : unknown;
};

/**
 * Maps values from an input object according to a mapping definition, applies optional transformations,
 * and validates the resulting object using a Zod schema.
 *
 * @template M - The type of the mapping definition object.
 * @template S - The Zod schema type.
 * @param obj - The source object to extract values from.
 * @param mapping - An object defining how to extract, default, and transform values from the source object.
 * @param schema - A Zod schema to validate the mapped and transformed result.
 * @returns An object with either the validated data (if successful) or validation errors (if failed).
 *
 * The function iterates over the mapping definition, extracts values from the source object using lodash's `get`,
 * applies any specified transformation, and then validates the result using the provided Zod schema.
 *
 * @example
 * import { z } from 'zod';
 *
 * const obj = { user: { name: 'Alice', age: '30' } };
 * const mapping = {
 *   name: { path: 'user.name' },
 *   age: { path: 'user.age', transform: (v) => Number(v) },
 * };
 * const schema = z.object({ name: z.string(), age: z.number() });
 *
 * const result = mapAndValidate(obj, mapping, schema);
 * // result = { data: { name: 'Alice', age: 30 }, isError: false, errors: undefined }
 */
export function mapAndValidate<M extends Mappings, S extends ZodType<any, any>>(
  obj: object,
  mapping: M,
  schema: S,
):
  | {
      data: z.infer<S>;
      isError: false;
      errors: undefined;
    }
  | {
      data: undefined;
      isError: true;
      errors: $ZodIssue[];
    } {
  const result = {} as ExtractedValues<M>;

  for (const key of Object.keys(mapping) as Array<keyof M>) {
    const entry = mapping[key];
    if (entry) {
      const { path, default: defaultVal, transform } = entry;
      let val = _.get(obj, path, defaultVal);
      if (transform) {
        val = transform(val);
      }
      result[key] = val;
    }
  }

  const parsed = schema.safeParse(result);

  if (parsed.success) {
    return { data: parsed.data, isError: false, errors: undefined };
  } else {
    return {
      data: undefined,
      isError: true,
      errors: parsed.error.issues as $ZodIssue[],
    };
  }
}
