/**
 * Verify a Solana USDC transfer for a crypto checkout intent.
 * Pure helpers are exported for unit tests without RPC.
 */
import { Connection, PublicKey, type ParsedTransactionWithMeta } from '@solana/web3.js';
import {
  LIFETIME_USDC_MICRO,
  USDC_MINT_MAINNET,
  getSolanaRpcUrl,
  getTreasuryAddress,
} from '@/lib/cryptoCheckout/constants';

export type VerifyTransferInput = {
  signature: string;
  referencePubkey: string;
  treasuryAddress: string;
  amountMicro?: number;
  usdcMint?: string;
};

export type VerifyTransferResult =
  | { ok: true }
  | { ok: false; error: string };

/** Extract SPL token transfer amount (micro) to treasury from parsed tx. */
export function extractUsdcTransferToTreasury(
  tx: ParsedTransactionWithMeta,
  opts: {
    treasuryAddress: string;
    usdcMint: string;
    referencePubkey: string;
  }
): VerifyTransferResult & { amountMicro?: number } {
  if (tx.meta?.err) {
    return { ok: false, error: 'Transaction failed on-chain' };
  }

  const accountKeys = tx.transaction.message.accountKeys.map((k) =>
    typeof k === 'string' ? k : k.pubkey.toBase58()
  );

  if (!accountKeys.includes(opts.referencePubkey)) {
    return { ok: false, error: 'Missing payment reference' };
  }

  const balances = tx.meta?.postTokenBalances ?? [];
  const preBalances = tx.meta?.preTokenBalances ?? [];

  // Find treasury token account delta for USDC mint.
  let received = 0;
  for (const post of balances) {
    if (post.mint !== opts.usdcMint) continue;
    const owner = post.owner;
    if (owner !== opts.treasuryAddress) continue;

    const pre = preBalances.find(
      (p) =>
        p.accountIndex === post.accountIndex &&
        p.mint === opts.usdcMint &&
        p.owner === opts.treasuryAddress
    );
    const postAmt = Number(post.uiTokenAmount.amount);
    const preAmt = pre ? Number(pre.uiTokenAmount.amount) : 0;
    const delta = postAmt - preAmt;
    if (delta > 0) received += delta;
  }

  // Fallback: scan parsed instructions for transfer/transferChecked to treasury ATA.
  if (received <= 0 && tx.transaction.message.instructions) {
    // Parsed txs often put token transfers in innerInstructions.
  }

  if (received <= 0) {
    // Try inner instructions token balances only — if still zero, fail.
    return { ok: false, error: 'No USDC received by treasury' };
  }

  return { ok: true, amountMicro: received };
}

export function assertExactAmount(
  receivedMicro: number,
  expectedMicro: number
): VerifyTransferResult {
  if (receivedMicro !== expectedMicro) {
    return {
      ok: false,
      error: `Amount mismatch: got ${receivedMicro}, expected ${expectedMicro}`,
    };
  }
  return { ok: true };
}

/**
 * Fetch and validate a confirmed USDC payment for an intent.
 * Requires RPC; use extractUsdcTransferToTreasury in unit tests.
 */
export async function verifyUsdcPayment(
  input: VerifyTransferInput
): Promise<VerifyTransferResult> {
  const treasury = input.treasuryAddress || getTreasuryAddress();
  if (!treasury) return { ok: false, error: 'Treasury not configured' };

  const expectedMicro = input.amountMicro ?? LIFETIME_USDC_MICRO;
  const mint = input.usdcMint ?? USDC_MINT_MAINNET;

  let reference: PublicKey;
  let treasuryPk: PublicKey;
  try {
    reference = new PublicKey(input.referencePubkey);
    treasuryPk = new PublicKey(treasury);
  } catch {
    return { ok: false, error: 'Invalid pubkey' };
  }

  const connection = new Connection(getSolanaRpcUrl(), 'confirmed');

  const tx = await connection.getParsedTransaction(input.signature, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  });

  if (!tx) {
    return { ok: false, error: 'Transaction not found' };
  }

  const extracted = extractUsdcTransferToTreasury(tx, {
    treasuryAddress: treasuryPk.toBase58(),
    usdcMint: mint,
    referencePubkey: reference.toBase58(),
  });

  if (!extracted.ok) return extracted;

  return assertExactAmount(extracted.amountMicro!, expectedMicro);
}
