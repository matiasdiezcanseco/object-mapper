import { test, expect, describe } from 'vitest';
import { mapAndValidate } from './map-and-validate.js';
import { z } from 'zod';

describe('mapAndValidate', () => {
  test('should return mapped values from object', () => {
    const data = {
      user: {
        name: 'Alice',
        age: 25,
      },
    };

    const mapping = {
      name: { path: 'user.name', default: 'Unknown' },
      email: { path: 'user.email', default: 'email@gmail.com' },
      age: { path: 'user.age', default: 0 },
    };
    const outputSchema = z.object({
      name: z.string(),
      email: z.email(),
      age: z.number().int(),
    });
    const expected = {
      name: 'Alice',
      email: 'email@gmail.com',
      age: 25,
    };
    const result = mapAndValidate(data, mapping, outputSchema);
    expect(result.isError).toBe(false);
    expect(result.data).toEqual(expected);
    expect(result.errors).toBeUndefined();
  });

  test('should return mapped values from object with arrays', () => {
    const data = {
      users: [
        { name: 'Bob', age: 30 },
        { name: 'Carol', age: 28 },
      ],
    };
    const mapping = {
      firstUserName: { path: 'users.0.name', default: 'Unknown' },
      secondUserAge: { path: 'users.1.age', default: 0 },
      thirdUserName: { path: 'users.2.name', default: 'NoName' },
    };
    const outputSchema = z.object({
      firstUserName: z.string(),
      secondUserAge: z.number().int(),
      thirdUserName: z.string(),
    });
    const expected = {
      firstUserName: 'Bob',
      secondUserAge: 28,
      thirdUserName: 'NoName',
    };
    const result = mapAndValidate(data, mapping, outputSchema);
    expect(result.isError).toBe(false);
    expect(result.data).toEqual(expected);
    expect(result.errors).toBeUndefined();
  });

  test('should return mapped values from a deeply nested object', () => {
    const data = {
      company: {
        departments: [
          {
            name: 'Engineering',
            teams: [
              {
                name: 'Backend',
                lead: { name: 'Dave', email: 'dave@company.com' },
              },
              {
                name: 'Frontend',
                lead: { name: 'Eve', email: 'eve@company.com' },
              },
            ],
          },
        ],
      },
    };
    const mapping = {
      backendLeadName: {
        path: 'company.departments.0.teams.0.lead.name',
        default: 'Unknown',
      },
      frontendLeadEmail: {
        path: 'company.departments.0.teams.1.lead.email',
        default: 'noemail@company.com',
      },
      nonExistent: {
        path: 'company.departments.1.teams.0.lead.name',
        default: 'Nobody',
      },
    };
    const outputSchema = z.object({
      backendLeadName: z.string(),
      frontendLeadEmail: z.string().email(),
      nonExistent: z.string(),
    });
    const expected = {
      backendLeadName: 'Dave',
      frontendLeadEmail: 'eve@company.com',
      nonExistent: 'Nobody',
    };
    const result = mapAndValidate(data, mapping, outputSchema);
    expect(result.isError).toBe(false);
    expect(result.data).toEqual(expected);
    expect(result.errors).toBeUndefined();
  });

  test('should return error if schema validation fails', () => {
    const data = {
      user: {
        name: 'Alice',
        age: 'not-a-number',
      },
    };
    const mapping = {
      name: { path: 'user.name', default: 'Unknown' },
      age: { path: 'user.age', default: 0 },
    };
    const outputSchema = z.object({
      name: z.string(),
      age: z.number().int(),
    });
    const result = mapAndValidate(data, mapping, outputSchema);
    expect(result.isError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(Array.isArray(result.errors)).toBe(true);
    if (result.errors) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  test('should apply transform function to mapped values', () => {
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
    const outputSchema = z.object({
      name: z.string(),
      age: z.number().int(),
    });
    const expected = {
      name: 'ALICE',
      age: 25,
    };
    const result = mapAndValidate(data, mapping, outputSchema);
    expect(result.isError).toBe(false);
    expect(result.data).toEqual(expected);
    expect(result.errors).toBeUndefined();
  });
});
