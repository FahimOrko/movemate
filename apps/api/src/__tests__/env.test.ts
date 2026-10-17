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

describe('parseEnv OpenRouter settings', () => {
  it('starts without any OpenRouter variable', () => {
    const env = parseEnv(validEnv);
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.OPENROUTER_VISION_MODEL).toBeUndefined();
    expect(env.OPENROUTER_TIMEOUT_MS).toBe(45000);
  });

  it('treats empty values as unset', () => {
    const env = parseEnv({ ...validEnv, OPENROUTER_API_KEY: '', OPENROUTER_VISION_MODEL: '' });
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.OPENROUTER_VISION_MODEL).toBeUndefined();
  });
});
