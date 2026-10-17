import { z, type ZodType } from 'zod';
import { env } from '../../env';
import { AppError } from '../errors';

const CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Turn on if results look weak. Off sends `reasoning: { effort: 'none' }`; a model that requires reasoning rejects that.
const REASONING_ENABLED = false;
const MAX_OUTPUT_TOKENS = 1200;
const RETRY_REMINDER = 'Your previous reply could not be used. Reply with only the JSON object described in the instructions.';

type CompleteJsonInput<T> = { system: string; text: string; images: Buffer[]; schema: ZodType<T> };
type Message = { role: 'system' | 'user'; content: string | unknown[] };
type Attempt<T> = { ok: true; value: T } | { ok: false };

export async function completeJson<T>({ system, text, images, schema }: CompleteJsonInput<T>): Promise<T> {
  const { OPENROUTER_API_KEY: apiKey, OPENROUTER_VISION_MODEL: model } = env;
  if (!apiKey || !model) throw new AppError('ai_not_configured', 'AI is not configured. Add checks by hand.');

  const imageParts = images.map((image) => ({
    type: 'image_url',
    image_url: { url: `data:image/jpeg;base64,${image.toString('base64')}` },
  }));
  const messages: Message[] = [
    { role: 'system', content: system },
    { role: 'user', content: [{ type: 'text', text }, ...imageParts] },
  ];
  const jsonSchema = z.toJSONSchema(schema);

  // Two attempts at most, written out so a retry loop cannot happen: the free tier has a small daily limit.
  const first = await attempt({ apiKey, model, messages, jsonSchema, schema, number: 1 });
  if (first.ok) return first.value;
  const retryMessages: Message[] = [...messages, { role: 'user', content: RETRY_REMINDER }];
  const second = await attempt({ apiKey, model, messages: retryMessages, jsonSchema, schema, number: 2 });
  if (second.ok) return second.value;
  throw new AppError('ai_failure', 'The AI returned an answer we could not read. Try again or add checks by hand.');
}

type AttemptInput<T> = {
  apiKey: string;
  model: string;
  messages: Message[];
  jsonSchema: unknown;
  schema: ZodType<T>;
  number: number;
};

async function attempt<T>({ apiKey, model, messages, jsonSchema, schema, number }: AttemptInput<T>): Promise<Attempt<T>> {
  const startedAt = Date.now();
  let outcome = 'failed';
  try {
    const response = await send(apiKey, {
      model,
      messages,
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: 'json_schema', json_schema: { name: 'result', strict: true, schema: jsonSchema } },
      ...(REASONING_ENABLED ? {} : { reasoning: { effort: 'none' } }),
    });
    const parsed = schema.safeParse(extractJson(readContent(response)));
    outcome = parsed.success ? 'ok' : 'invalid_output';
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
  } finally {
    console.info(`[ai] model=${model} attempt=${number} duration=${Date.now() - startedAt}ms outcome=${outcome}`);
  }
}

async function send(apiKey: string, body: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(env.OPENROUTER_TIMEOUT_MS),
    });
  } catch (error) {
    throw error instanceof DOMException && error.name === 'TimeoutError'
      ? new AppError('ai_failure', 'The AI took too long to answer. Try again or add checks by hand.')
      : new AppError('ai_failure', 'Could not reach the AI service. Try again or add checks by hand.');
  }
  if (!response.ok) throw httpError(response.status);
  const payload: unknown = await response.json().catch(() => null);
  // OpenRouter reports upstream provider failures inside a 200 response.
  if (isRecord(payload) && 'error' in payload) throw httpError(502);
  return payload;
}

function httpError(status: number): AppError {
  if (status === 429) return new AppError('ai_failure', 'The AI rate limit was reached. Try again later or add checks by hand.');
  if (status >= 500) return new AppError('ai_failure', 'The AI service is unavailable right now. Try again later or add checks by hand.');
  console.error(`[ai] request rejected with status ${status}`);
  return new AppError('ai_failure', 'The AI request was rejected. Check the model and API key, or add checks by hand.');
}

function readContent(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) return undefined;
  const choice: unknown = payload.choices[0];
  if (!isRecord(choice) || choice.finish_reason === 'length') return undefined;
  return isRecord(choice.message) ? choice.message.content : undefined;
}

// Free models often wrap the JSON in prose or a code fence, so take the outermost {...}.
export function extractJson(content: unknown): unknown {
  if (typeof content !== 'string') return undefined;
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) return undefined;
  try {
    return JSON.parse(content.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
