import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URLS = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
} as const;

export type NetworkType = keyof typeof HORIZON_URLS;

export interface BalanceEntry {
  assetType: string;
  assetCode: string;
  assetIssuer: string | null;
  balance: string;
}

export interface AccountBalances {
  accountId: string;
  balances: BalanceEntry[];
}

function getServer(network: NetworkType = "testnet"): Horizon.Server {
  return new Horizon.Server(HORIZON_URLS[network]);
}

function parseBalance(
  bal: Horizon.HorizonApi.BalanceLine
): BalanceEntry {
  if (bal.asset_type === "native") {
    return {
      assetType: "native",
      assetCode: "XLM",
      assetIssuer: null,
      balance: bal.balance,
    };
  }

  // Credit alphanum4 or alphanum12
  const creditBal = bal as Horizon.HorizonApi.BalanceLineAsset;
  return {
    assetType: bal.asset_type,
    assetCode: creditBal.asset_code,
    assetIssuer: creditBal.asset_issuer,
    balance: bal.balance,
  };
}

/**
 * Fetch all balances (XLM + custom tokens) for a Stellar account.
 */
export async function fetchAccountBalances(
  accountId: string,
  network: NetworkType = "testnet"
): Promise<AccountBalances> {
  const server = getServer(network);

  try {
    const account = await server.loadAccount(accountId);
    return {
      accountId,
      balances: account.balances.map(parseBalance),
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      throw new Error(`Account not found: ${accountId}`);
    }
    throw new Error(
      `Failed to fetch balances: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get just the native XLM balance for an account.
 */
export async function fetchXlmBalance(
  accountId: string,
  network: NetworkType = "testnet"
): Promise<string> {
  const { balances } = await fetchAccountBalances(accountId, network);
  const xlm = balances.find((b) => b.assetType === "native");
  return xlm?.balance ?? "0";
}
