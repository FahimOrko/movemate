import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AppError } from '../errors';
import { completeJson } from '../ai/openrouter.client';

const schema = z.object({ checks: z.array(z.string()) });
const input = { system: 'sys', text: 'Room: kitchen', images: [Buffer.from('secret-image-bytes')], schema };

const fetchMock = vi.fn();

function reply(content: unknown, finishReason = 'stop') {
  return new Response(JSON.stringify({ choices: [{ finish_reason: finishReason, message: { content } }] }), { status: 200 });
}

async function failureOf(promise: Promise<unknown>): Promise<AppError> {
  const error = await promise.then(
    () => undefined,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(AppError);
  return error as AppError;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('completeJson', () => {
  it('sends the image as a data URL with a json_schema format and reasoning off', async () => {
    fetchMock.mockResolvedValueOnce(reply('{"checks":["a"]}'));
    await expect(completeJson(input)).resolves.toEqual({ checks: ['a'] });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('test/vision-model');
    expect(body.messages[1].content[1].image_url.url).toBe(`data:image/jpeg;base64,${Buffer.from('secret-image-bytes').toString('base64')}`);
    expect(body.response_format.type).toBe('json_schema');
    expect(body.reasoning).toEqual({ effort: 'none' });
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer test-key');
  });

  it('parses JSON wrapped in a code fence and prose', async () => {
    fetchMock.mockResolvedValueOnce(reply('Sure! Here you go:\n```json\n{"checks":["a","b"]}\n```\nHope it helps.'));
    await expect(completeJson(input)).resolves.toEqual({ checks: ['a', 'b'] });
  });

  it('retries once on invalid JSON, with a reminder, then succeeds', async () => {
    fetchMock.mockResolvedValueOnce(reply('not json at all')).mockResolvedValueOnce(reply('{"checks":[]}'));
    await expect(completeJson(input)).resolves.toEqual({ checks: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = JSON.parse((fetchMock.mock.calls[1] as [string, RequestInit])[1].body as string);
    expect(body.messages.at(-1).content).toMatch(/could not be used/);
  });

  it('retries once when the JSON fails the schema', async () => {
    fetchMock.mockResolvedValueOnce(reply('{"checks":"nope"}')).mockResolvedValueOnce(reply('{"checks":["a"]}'));
    await expect(completeJson(input)).resolves.toEqual({ checks: ['a'] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives 502 after two invalid answers and never calls a third time', async () => {
    fetchMock.mockResolvedValue(reply('garbage'));
    const error = await failureOf(completeJson(input));
    expect(error.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats a truncated answer as invalid', async () => {
    fetchMock.mockResolvedValueOnce(reply('{"checks":["a"', 'length')).mockResolvedValueOnce(reply('{"checks":["a"]}'));
    await expect(completeJson(input)).resolves.toEqual({ checks: ['a'] });
  });

  it.each([
    [429, /rate limit/],
    [500, /unavailable/],
    [503, /unavailable/],
    [401, /rejected/],
  ])('maps HTTP %i to 502 without retrying', async (status, message) => {
    fetchMock.mockResolvedValue(new Response('{}', { status }));
    const error = await failureOf(completeJson(input));
    expect(error.status).toBe(502);
    expect(error.message).toMatch(message);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps an error body inside a 200 to 502 without retrying', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: { code: 502, message: 'upstream' } }), { status: 200 }));
    expect((await failureOf(completeJson(input))).status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps a timeout to 502 without retrying', async () => {
    fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    const error = await failureOf(completeJson(input));
    expect(error.status).toBe(502);
    expect(error.message).toMatch(/too long/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps a network error to 502 without retrying', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    expect((await failureOf(completeJson(input))).message).toMatch(/Could not reach/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('logs the model and duration but no image data, answer or key', async () => {
    fetchMock.mockResolvedValueOnce(reply('{"checks":["private answer"]}'));
    await completeJson(input);
    const logged = vi.mocked(console.info).mock.calls.flat().join(' ');
    expect(logged).toMatch(/model=test\/vision-model .*duration=\d+ms/);
    expect(logged).not.toContain(Buffer.from('secret-image-bytes').toString('base64'));
    expect(logged).not.toContain('private answer');
    expect(logged).not.toContain('test-key');
  });
});
