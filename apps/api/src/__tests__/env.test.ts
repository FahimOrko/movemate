import { describe, expect, it } from 'vitest';
import { parseEnv } from '../env';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '4000',
  DATABASE_URL: 'postgresql://movemate:secret@localhost:5433/movemate',
};

describe('parseEnv', () => {
  it('coerces PORT to a number', () => {
    expect(parseEnv(validEnv).PORT).toBe(4000);
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });

  it('rejects a DATABASE_URL that is not postgres', () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: 'mysql://localhost/db' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => parseEnv({ ...validEnv, PORT: 'abc' })).toThrow(/PORT/);
  });
});
