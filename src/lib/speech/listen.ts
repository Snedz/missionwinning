/**
 * Browser speech-to-text for Coach chat.
 *
 * We never upload audio. The words land in the same input as typing, then the
 * existing `/api/coach/chat` JSON path. Chrome's SpeechRecognition may still
 * use the browser vendor's speech service — that is the browser, not our LLM.
 */

export type ListenSupport = 'ready' | 'unsupported';

type RecognitionResultLike = {
  results?: ArrayLike<{ 0?: { transcript?: string } }>;
};

export type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: RecognitionResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  abort: () => void;
};

export type RecognitionCtor = new () => RecognitionLike;

export function getSpeechRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function listenSupport(): ListenSupport {
  return getSpeechRecognitionCtor() ? 'ready' : 'unsupported';
}

/** Collapse recognition junk so Send sees the same shape as a typed line. */
export function normalizeHeardTranscript(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\s+/g, ' ').trim();
}

/** Join SpeechRecognition alternatives into one line. */
export function heardTranscriptFromResult(
  result: RecognitionResultLike | null | undefined
): string {
  const list = result?.results;
  if (!list || list.length === 0) return '';
  const parts: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const text = list[i]?.[0]?.transcript;
    if (text) parts.push(text);
  }
  return normalizeHeardTranscript(parts.join(' '));
}
