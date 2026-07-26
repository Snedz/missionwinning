import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Modernist HTML emails (design handoff 2026-07-25, rebrand wave D5).
 *
 * The three files in `templates/` are the handoff's send-ready artifacts —
 * table-layout HTML with inline styles, kept byte-for-byte rather than rebuilt
 * in JSX, because that markup is what survives Outlook. Everything that must
 * differ per send is a literal in those files, replaced here:
 *
 *   https://www.missionwinning.com/unsubscribe → the real HMAC unsubscribe URL
 *   [postal address], USA                      → MAIL_POSTAL_ADDRESS
 *   MW-ALPHA-2026                              → the invitee's real code
 *   https://www.missionwinning.com             → siteUrl() (preview/staging)
 *
 * Substitution is literal string replacement, not a template engine: the values
 * are ours (not user input), and a mustache pass over 17 KB of inline CSS is a
 * bigger risk than the four replacements it would save.
 */

const TEMPLATE_DIR = path.join(process.cwd(), 'src/emails/templates');

export type EmailTemplateName = 'waitlist-confirm' | 'launch-day' | 'beta-invite';

const PLACEHOLDER_UNSUBSCRIBE = 'https://www.missionwinning.com/unsubscribe';
const PLACEHOLDER_POSTAL = '[postal address], USA';
const PLACEHOLDER_CODE = 'MW-ALPHA-2026';
const PLACEHOLDER_ORIGIN = 'https://www.missionwinning.com';

/**
 * CAN-SPAM §7704(a)(5) requires a valid physical postal address in every
 * commercial email. This is founder data — it is never invented here. When
 * unset, `renderEmail` refuses to produce a body rather than shipping a
 * placeholder into someone's inbox.
 */
export function postalAddress(): string {
  return process.env.MAIL_POSTAL_ADDRESS?.trim() || '';
}

function readTemplate(name: EmailTemplateName): string {
  return fs.readFileSync(path.join(TEMPLATE_DIR, `${name}.html`), 'utf8');
}

export type RenderEmailOptions = {
  /** Full HMAC unsubscribe URL — required for list mail (waitlist, launch). */
  unsubscribeUrl?: string;
  /** Real access code — beta-invite only. */
  accessCode?: string;
  /** Origin override so preview/staging sends do not link to production. */
  origin?: string;
};

export type RenderEmailResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

export function renderEmail(
  name: EmailTemplateName,
  options: RenderEmailOptions = {}
): RenderEmailResult {
  const postal = postalAddress();
  if (!postal) {
    return {
      ok: false,
      error:
        'MAIL_POSTAL_ADDRESS is unset — CAN-SPAM requires a physical postal address in commercial email. Set it before sending (docs/ENV.md).',
    };
  }

  let html = readTemplate(name);

  if (options.origin && options.origin !== PLACEHOLDER_ORIGIN) {
    html = html.split(PLACEHOLDER_ORIGIN).join(options.origin);
  }

  // Unsubscribe is replaced after origin so the origin pass cannot rewrite it.
  if (options.unsubscribeUrl) {
    const rewritten = options.origin
      ? PLACEHOLDER_UNSUBSCRIBE.replace(PLACEHOLDER_ORIGIN, options.origin)
      : PLACEHOLDER_UNSUBSCRIBE;
    html = html.split(rewritten).join(options.unsubscribeUrl);
  } else if (html.includes(PLACEHOLDER_UNSUBSCRIBE)) {
    return {
      ok: false,
      error: `${name} carries an unsubscribe link but no unsubscribeUrl was supplied.`,
    };
  }

  html = html.split(PLACEHOLDER_POSTAL).join(`${postal}`);

  if (name === 'beta-invite') {
    if (!options.accessCode) {
      return { ok: false, error: 'beta-invite requires an accessCode.' };
    }
    html = html.split(PLACEHOLDER_CODE).join(options.accessCode);
  }

  return { ok: true, html };
}
