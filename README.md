# @matiasdc/object-mapper

A TypeScript utility for mapping and validating objects with a simple, declarative API. Uses [Zod](https://github.com/colinhacks/zod) for validation and [Lodash](https://lodash.com/) for deep property access.

## Features

- Map deeply nested object properties to a flat structure
- Apply default values and transformation functions
- Validate the result with a Zod schema
- Type-safe and easy to use

## Installation

```bash
npm install @matiasdc/object-mapper zod lodash
```

## Usage

```typescript
import { mapAndValidate } from '@matiasdc/object-mapper';
import { z } from 'zod';

const obj = { user: { name: 'Alice', age: '30' } };
const mapping = {
  name: { path: 'user.name' },
  age: { path: 'user.age', transform: (v) => Number(v) },
};
const schema = z.object({ name: z.string(), age: z.number() });

const result = mapAndValidate(obj, mapping, schema);
// result = { data: { name: 'Alice', age: 30 }, isError: false, errors: undefined }
```

## API

### `mapAndValidate(obj, mapping, schema)`

- `obj`: The source object.
- `mapping`: An object where each key defines:
  - `path` (string): Dot notation path to the value in `obj`.
  - `default` (optional): Default value if the path is missing.
  - `transform` (optional): Function to transform the value.
- `schema`: A Zod schema to validate the mapped result.

Returns an object:

- On success: `{ data, isError: false, errors: undefined }`
- On validation error: `{ data: undefined, isError: true, errors }`

## Example

```typescript
const data = {
  user: {
    name: 'Alice',
    age: '25',
  },
};
const mapping = {
  name: {
    path: 'user.name',
    default: 'Unknown',
    transform: (v: string) => v.toUpperCase(),
  },
  age: {
    path: 'user.age',
    default: 0,
    transform: (v: string) => parseInt(v, 10),
  },
};
const schema = z.object({ name: z.string(), age: z.number().int() });

const result = mapAndValidate(data, mapping, schema);
// result = { data: { name: 'ALICE', age: 25 }, isError: false, errors: undefined }
```

## License

MIT
