import './setup';
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { YouthParentGate } from '../../src/components/fitness-test/YouthParentGate';

const CONSENT_KEY = 'mw_youth_parent_consent';

function mockFetch(responses: Record<string, { ok: boolean; body: unknown }>) {
  mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = String(input);
    for (const [path, res] of Object.entries(responses)) {
      if (url.includes(path)) {
        return new Response(JSON.stringify(res.body), { status: res.ok ? 200 : 400 });
      }
    }
    return new Response('{}', { status: 404 });
  });
}

describe('YouthParentGate', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mock.restoreAll();
    // Default: consent-status merge returns nothing.
    mockFetch({ '/api/youth/consent-status': { ok: false, body: {} } });
  });

  it('renders nothing for ages 13 and up (no consent required)', () => {
    const { container } = render(<YouthParentGate childAge={13} onConsented={() => {}} />);
    assert.equal(container.innerHTML, '');
  });

  it('renders nothing when verified consent already exists', () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        parentEmail: 'parent@example.com',
        childAge: 10,
        consentedAt: new Date().toISOString(),
        verified: true,
      })
    );
    const { container } = render(<YouthParentGate childAge={10} onConsented={() => {}} />);
    assert.equal(container.innerHTML, '');
  });

  it('shows the parent approval gate for under-13 athletes', () => {
    render(<YouthParentGate childAge={10} onConsented={() => {}} />);
    assert.ok(screen.getByText(/Parent or guardian approval/i));
    assert.ok(screen.getByText(/under 13/i));
  });

  it('rejects an invalid parent email', async () => {
    render(<YouthParentGate childAge={9} onConsented={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('parent@example.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send verification email/i }));
    await waitFor(() => assert.ok(screen.getByText(/valid parent or guardian email/i)));
    assert.equal(localStorage.getItem(CONSENT_KEY), null);
  });

  it('requires the consent checkbox before sending', async () => {
    render(<YouthParentGate childAge={9} onConsented={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('parent@example.com'), {
      target: { value: 'parent@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send verification email/i }));
    await waitFor(() => assert.ok(screen.getByText(/must accept the youth privacy notice/i)));
    assert.equal(localStorage.getItem(CONSENT_KEY), null);
  });

  it('saves unverified consent and advances to the code step on valid request', async () => {
    mockFetch({
      '/api/youth/consent-status': { ok: false, body: {} },
      '/api/youth/consent-notify': { ok: true, body: { ok: true } },
    });
    render(<YouthParentGate childAge={9} onConsented={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('parent@example.com'), {
      target: { value: 'parent@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Send verification email/i }));

    await waitFor(() => assert.ok(screen.getByText(/Enter verification code/i)));

    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY)!);
    assert.equal(saved.parentEmail, 'parent@example.com');
    assert.equal(saved.verified, false);
  });

  it('rejects a wrong verification code without consenting', async () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        parentEmail: 'parent@example.com',
        childAge: 9,
        consentedAt: new Date().toISOString(),
        verified: false,
      })
    );
    mockFetch({
      '/api/youth/consent-status': { ok: false, body: {} },
      '/api/youth/consent-verify': { ok: false, body: { ok: false } },
    });

    let consented = false;
    render(<YouthParentGate childAge={9} onConsented={() => { consented = true; }} />);

    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & continue/i }));

    await waitFor(() => assert.ok(screen.getByText(/Incorrect verification code/i)));
    assert.equal(consented, false);
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY)!);
    assert.equal(saved.verified, false);
  });

  it('marks consent verified and calls onConsented for a correct code', async () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        parentEmail: 'parent@example.com',
        childAge: 9,
        consentedAt: new Date().toISOString(),
        verified: false,
      })
    );
    mockFetch({
      '/api/youth/consent-status': { ok: false, body: {} },
      '/api/youth/consent-verify': { ok: true, body: { ok: true } },
    });

    let consented = false;
    render(<YouthParentGate childAge={9} onConsented={() => { consented = true; }} />);

    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & continue/i }));

    await waitFor(() => assert.equal(consented, true));
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY)!);
    assert.equal(saved.verified, true);
  });
});
