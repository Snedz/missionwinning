import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ParsedTransactionWithMeta } from '@solana/web3.js';
import {
  assertExactAmount,
  extractUsdcTransferToTreasury,
} from '@/lib/cryptoCheckout/verifyTransfer';
import { LIFETIME_USDC_MICRO, USDC_MINT_MAINNET } from '@/lib/cryptoCheckout/constants';

const TREASURY = 'Treasury1111111111111111111111111111111111';
const REF = 'Reference111111111111111111111111111111111';

function fakeTx(opts: {
  includeRef?: boolean;
  err?: unknown;
  preAmount?: string;
  postAmount?: string;
  mint?: string;
  owner?: string;
}): ParsedTransactionWithMeta {
  const includeRef = opts.includeRef !== false;
  const mint = opts.mint ?? USDC_MINT_MAINNET;
  const owner = opts.owner ?? TREASURY;
  return {
    slot: 1,
    meta: {
      err: opts.err ?? null,
      fee: 5000,
      preBalances: [],
      postBalances: [],
      preTokenBalances: [
        {
          accountIndex: 1,
          mint,
          owner,
          uiTokenAmount: {
            amount: opts.preAmount ?? '0',
            decimals: 6,
            uiAmount: 0,
            uiAmountString: '0',
          },
        },
      ],
      postTokenBalances: [
        {
          accountIndex: 1,
          mint,
          owner,
          uiTokenAmount: {
            amount: opts.postAmount ?? String(LIFETIME_USDC_MICRO),
            decimals: 6,
            uiAmount: 149,
            uiAmountString: '149',
          },
        },
      ],
      innerInstructions: null,
      logMessages: null,
      rewards: null,
      status: { Ok: null },
    },
    transaction: {
      signatures: ['sig'],
      message: {
        accountKeys: includeRef
          ? [
              { pubkey: { toBase58: () => 'payer' }, signer: true, writable: true },
              { pubkey: { toBase58: () => REF }, signer: false, writable: false },
            ]
          : [{ pubkey: { toBase58: () => 'payer' }, signer: true, writable: true }],
        instructions: [],
        recentBlockhash: 'x',
      },
    },
  } as unknown as ParsedTransactionWithMeta;
}

describe('extractUsdcTransferToTreasury', () => {
  it('accepts exact USDC credit to treasury with reference', () => {
    const result = extractUsdcTransferToTreasury(fakeTx({}), {
      treasuryAddress: TREASURY,
      usdcMint: USDC_MINT_MAINNET,
      referencePubkey: REF,
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.amountMicro, LIFETIME_USDC_MICRO);
  });

  it('rejects missing reference', () => {
    const result = extractUsdcTransferToTreasury(fakeTx({ includeRef: false }), {
      treasuryAddress: TREASURY,
      usdcMint: USDC_MINT_MAINNET,
      referencePubkey: REF,
    });
    assert.equal(result.ok, false);
  });

  it('rejects failed transaction', () => {
    const result = extractUsdcTransferToTreasury(fakeTx({ err: { InstructionError: [0, 'Custom'] } }), {
      treasuryAddress: TREASURY,
      usdcMint: USDC_MINT_MAINNET,
      referencePubkey: REF,
    });
    assert.equal(result.ok, false);
  });

  it('rejects wrong mint', () => {
    const result = extractUsdcTransferToTreasury(fakeTx({ mint: 'WrongMint1111111111111111111111111111111' }), {
      treasuryAddress: TREASURY,
      usdcMint: USDC_MINT_MAINNET,
      referencePubkey: REF,
    });
    assert.equal(result.ok, false);
  });

  it('rejects wrong treasury owner', () => {
    const result = extractUsdcTransferToTreasury(fakeTx({ owner: 'OtherOwner11111111111111111111111111111' }), {
      treasuryAddress: TREASURY,
      usdcMint: USDC_MINT_MAINNET,
      referencePubkey: REF,
    });
    assert.equal(result.ok, false);
  });
});

describe('assertExactAmount', () => {
  it('passes matching micro amount', () => {
    assert.equal(assertExactAmount(LIFETIME_USDC_MICRO, LIFETIME_USDC_MICRO).ok, true);
  });

  it('fails mismatch', () => {
    assert.equal(assertExactAmount(100, LIFETIME_USDC_MICRO).ok, false);
  });
});
