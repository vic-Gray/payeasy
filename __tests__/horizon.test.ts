import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLoadAccount = vi.fn();

vi.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: class MockServer {
      constructor() {
        // no-op
      }
      loadAccount = mockLoadAccount;
    },
  },
}));

import { fetchAccountBalances, fetchXlmBalance } from "../lib/stellar/horizon";

describe("fetchAccountBalances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed XLM and token balances", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          balance: "100.0000000",
          asset_type: "native",
        },
        {
          balance: "50.0000000",
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer:
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        },
      ],
    });

    const result = await fetchAccountBalances("GABC123", "testnet");

    expect(result.accountId).toBe("GABC123");
    expect(result.balances).toHaveLength(2);

    expect(result.balances[0]).toEqual({
      assetType: "native",
      assetCode: "XLM",
      assetIssuer: null,
      balance: "100.0000000",
    });

    expect(result.balances[1]).toEqual({
      assetType: "credit_alphanum4",
      assetCode: "USDC",
      assetIssuer:
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      balance: "50.0000000",
    });
  });

  it("throws on account not found (404)", async () => {
    const error = new Error("Not Found");
    Object.assign(error, { response: { status: 404 } });
    mockLoadAccount.mockRejectedValue(error);

    await expect(
      fetchAccountBalances("GNOTFOUND", "testnet")
    ).rejects.toThrow("Account not found: GNOTFOUND");
  });

  it("throws on network failure", async () => {
    mockLoadAccount.mockRejectedValue(new Error("Network error"));

    await expect(
      fetchAccountBalances("GABC123", "testnet")
    ).rejects.toThrow("Failed to fetch balances: Network error");
  });
});

describe("fetchXlmBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the native XLM balance", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [{ balance: "250.5000000", asset_type: "native" }],
    });

    const balance = await fetchXlmBalance("GABC123", "testnet");
    expect(balance).toBe("250.5000000");
  });

  it("returns '0' if no native balance found", async () => {
    mockLoadAccount.mockResolvedValue({ balances: [] });

    const balance = await fetchXlmBalance("GABC123", "testnet");
    expect(balance).toBe("0");
  });
});
