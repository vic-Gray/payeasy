import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";
import { signWithFreighter } from "@/lib/stellar/wallet";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export interface ContributeParams {
  /** Public key of the contributing roommate */
  from: string;
  /** Contribution amount (in stroops, i128) */
  amount: bigint;
  /** Deployed rent escrow contract ID */
  contractId: string;
}

export interface ContributeResult {
  success: boolean;
  txHash: string;
  ledger: number;
}

/**
 * Build, sign, and submit a contribution transaction to the rent escrow contract.
 */
export async function contribute(
  params: ContributeParams
): Promise<ContributeResult> {
  const { from, amount, contractId } = params;
  const server = new rpc.Server(SOROBAN_RPC_URL);

  // Load the source account
  const sourceAccount = await server.getAccount(from);

  // Build the contract call operation using Contract.call()
  const contract = new Contract(contractId);
  const operation = contract.call(
    "contribute",
    nativeToScVal(Address.fromString(from), { type: "address" }),
    nativeToScVal(amount, { type: "i128" })
  );

  // Build the transaction
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  // Simulate to get the correct footprint and resource fees
  const simulated = await server.simulateTransaction(transaction);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const assembledTx = rpc.assembleTransaction(
    transaction,
    simulated
  ).build();

  // Sign with Freighter
  const signedXdr = await signWithFreighter(
    assembledTx.toXDR(),
    Networks.TESTNET
  );

  // Submit the signed transaction
  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    Networks.TESTNET
  );

  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${sendResult.status}`);
  }

  // Poll for confirmation
  const txHash = sendResult.hash;
  let getResult = await server.getTransaction(txHash);

  while (getResult.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    getResult = await server.getTransaction(txHash);
  }

  if (getResult.status === "FAILED") {
    throw new Error("Transaction failed on-chain");
  }

  return {
    success: true,
    txHash,
    ledger: getResult.latestLedger,
  };
}
