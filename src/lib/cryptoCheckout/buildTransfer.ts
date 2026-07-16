/**
 * Client-side Solana USDC transfer with Solana Pay-style reference account.
 */
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  LIFETIME_USDC_AMOUNT,
  LIFETIME_USDC_MICRO,
  USDC_DECIMALS,
  USDC_MINT_MAINNET,
} from '@/lib/cryptoCheckout/constants';

export type BuildLifetimeTransferInput = {
  rpcUrl: string;
  payer: string;
  treasury: string;
  reference: string;
  amountUsdc?: number;
};

/**
 * Build a VersionedTransaction that transfers lifetime USDC to treasury
 * and includes the intent `reference` as a readonly account (Solana Pay matching).
 */
export async function buildLifetimeUsdcTransfer(
  input: BuildLifetimeTransferInput
): Promise<VersionedTransaction> {
  const connection = new Connection(input.rpcUrl, 'confirmed');
  const payer = new PublicKey(input.payer);
  const recipient = new PublicKey(input.treasury);
  const reference = new PublicKey(input.reference);
  const mint = new PublicKey(USDC_MINT_MAINNET);

  const amountUsdc = input.amountUsdc ?? LIFETIME_USDC_AMOUNT;
  const amountMicro =
    amountUsdc === LIFETIME_USDC_AMOUNT
      ? LIFETIME_USDC_MICRO
      : Math.round(amountUsdc * 10 ** USDC_DECIMALS);

  const fromAta = await getAssociatedTokenAddress(mint, payer);
  const toAta = await getAssociatedTokenAddress(mint, recipient);

  const instructions = [];

  try {
    await getAccount(connection, toAta);
  } catch {
    instructions.push(
      createAssociatedTokenAccountInstruction(payer, toAta, recipient, mint)
    );
  }

  const transferIx = createTransferInstruction(
    fromAta,
    toAta,
    payer,
    amountMicro,
    [],
    TOKEN_PROGRAM_ID
  );
  // Solana Pay reference: readonly nonsigner key on the transfer instruction.
  transferIx.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });
  instructions.push(transferIx);

  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}
