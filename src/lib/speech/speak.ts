/**
 * On-device speech. No network, no API key, no vendor.
 *
 * `speechSynthesis` ships in every browser this app targets and costs nothing, which
 * is why Phase 0 of voice is free and offline: the coach reads text the rules engine
 * already composed. A cloud voice can replace the *renderer* later without any caller
 * changing, because everything above this file deals in strings.
 *
 * Support is uneven in ways that matter:
 * - **iOS Safari requires the call to originate in a user gesture.** A `speak()` fired
 *   from a timer or an effect is silently dropped, which is why every caller here is a
 *   button press and none of it is automatic.
 * - Voices load asynchronously on some engines; we do not wait for them, because the
 *   default voice is always acceptable and blocking a tap on a voice list is worse
 *   than a slightly different accent.
 * - `cancel()` before `speak()` is deliberate: tapping Listen twice should restart the
 *   briefing, not queue a second one behind the first.
 */

export type SpeechSupport = 'ready' | 'unsupported';

export function speechSupport(): SpeechSupport {
  if (typeof window === 'undefined') return 'unsupported';
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'
    ? 'ready'
    : 'unsupported';
}

export function isSpeaking(): boolean {
  if (speechSupport() === 'unsupported') return false;
  return window.speechSynthesis.speaking;
}

export function stopSpeaking(): void {
  if (speechSupport() === 'unsupported') return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* a failed cancel must never break a render */
  }
}

export interface SpeakOptions {
  /** Slightly under natural pace — coaching cues land better a touch slow. */
  rate?: number;
  lang?: string;
  onEnd?: () => void;
}

/**
 * Speak text. Returns false when the platform cannot, so callers can hide the control
 * rather than offer a button that does nothing.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (speechSupport() === 'unsupported') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(trimmed);
    utterance.rate = options.rate ?? 0.95;
    if (options.lang) utterance.lang = options.lang;
    if (options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
