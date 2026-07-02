import './setup';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UnlockButton } from '../../src/components/UnlockButton';

describe('UnlockButton', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    // grantPremiumDemo only writes the demo flags outside production builds.
    (process.env as Record<string, string>).NODE_ENV = 'development';
  });

  it('renders the demo request form with a derived label', () => {
    render(<UnlockButton productId="bodybuilding" />);
    assert.ok(screen.getByPlaceholderText(/your@email.com/i));
    assert.ok(screen.getByRole('button', { name: /Request Access — \$297/ }));
  });

  it('renders a subscription label for the Super Bundle', () => {
    render(<UnlockButton isSubscription price="12" />);
    assert.ok(screen.getByRole('button', { name: /Unlock Super Bundle \(\$12\/mo\)/ }));
  });

  it('shows a Stripe checkout link when a checkout URL is configured', () => {
    render(<UnlockButton isSubscription price="12" stripeCheckoutUrl="https://buy.stripe.com/test_123" />);
    const link = screen.getByRole('link', { name: /Stripe Checkout/ }) as HTMLAnchorElement;
    assert.equal(link.href, 'https://buy.stripe.com/test_123');
    assert.equal(link.rel, 'noopener noreferrer');
    assert.ok(screen.getByRole('button', { name: /Or request demo access/ }));
  });

  it('does not grant demo premium when submitted without an email', () => {
    render(<UnlockButton productId="bodybuilding" />);
    fireEvent.submit(screen.getByRole('button', { name: /Request Access/ }).closest('form')!);
    assert.notEqual(localStorage.getItem('mw_premium'), 'true');
  });

  it('grants demo premium locally and confirms after email submit', async () => {
    let succeeded = false;
    render(<UnlockButton isSubscription onSuccess={() => { succeeded = true; }} />);

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'buyer@example.com' },
    });
    fireEvent.submit(screen.getByPlaceholderText(/your@email.com/i).closest('form')!);

    await waitFor(() => {
      assert.ok(screen.getByText(/Demo access granted/i));
    });
    assert.equal(localStorage.getItem('mw_premium'), 'true');
    assert.equal(localStorage.getItem('mw_bundle_active'), 'true');
    assert.ok(screen.getByText(/buyer@example.com/));

    await waitFor(() => assert.equal(succeeded, true), { timeout: 3000 });
  });
});
