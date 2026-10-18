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

describe('parseEnv IF_INSURANCE_URL', () => {
  it('starts without it', () => {
    expect(parseEnv(validEnv).IF_INSURANCE_URL).toBeUndefined();
  });

  it('treats an empty value as unset', () => {
    expect(parseEnv({ ...validEnv, IF_INSURANCE_URL: '' }).IF_INSURANCE_URL).toBeUndefined();
  });

  it('rejects a value that is not a url', () => {
    expect(() => parseEnv({ ...validEnv, IF_INSURANCE_URL: 'not a url' })).toThrow(/IF_INSURANCE_URL/);
  });
});

describe('parseEnv ENABLE_RESET', () => {
  it('defaults to false and treats empty as unset', () => {
    expect(parseEnv(validEnv).ENABLE_RESET).toBe(false);
    expect(parseEnv({ ...validEnv, ENABLE_RESET: '' }).ENABLE_RESET).toBe(false);
  });

  it('parses true', () => {
    expect(parseEnv({ ...validEnv, ENABLE_RESET: 'true' }).ENABLE_RESET).toBe(true);
  });

  it('rejects other values', () => {
    expect(() => parseEnv({ ...validEnv, ENABLE_RESET: 'yes' })).toThrow(/ENABLE_RESET/);
  });
});
