import { describe, it as test } from "node:test";
import assert from "node:assert";
import { translateStellarError, StellarErrorType, getWalletError, WalletErrorCode } from "./errors.ts";

const expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toContain: (expected) => assert.ok(actual?.includes(expected) || actual?.message?.includes(expected)),
});

describe("getWalletError", () => {
  test("USER_DECLINED: maps 'User declined' message", () => {
    const result = getWalletError(new Error("User declined transaction"));
    assert.strictEqual(result.code, WalletErrorCode.USER_DECLINED);
    assert.strictEqual(result.message, "You declined the connection request.");
  });

  test("USER_DECLINED: maps 'reject' message", () => {
    const result = getWalletError(new Error("user rejected the request"));
    assert.strictEqual(result.code, WalletErrorCode.USER_DECLINED);
  });

  test("NOT_INSTALLED: maps 'Freighter extension not found' message", () => {
    const result = getWalletError(new Error("Freighter extension not found. Please install it to continue."));
    assert.strictEqual(result.code, WalletErrorCode.NOT_INSTALLED);
    assert.strictEqual(result.message, "Freighter wallet is not installed.");
  });

  test("NOT_INSTALLED: maps 'not installed' string", () => {
    const result = getWalletError("wallet not installed");
    assert.strictEqual(result.code, WalletErrorCode.NOT_INSTALLED);
  });

  test("NETWORK_MISMATCH: maps 'network mismatch' message", () => {
    const result = getWalletError(new Error("network mismatch detected"));
    assert.strictEqual(result.code, WalletErrorCode.NETWORK_MISMATCH);
    assert.strictEqual(result.message, "Your wallet is on the wrong network.");
  });

  test("NETWORK_MISMATCH: maps 'wrong network' message", () => {
    const result = getWalletError(new Error("wrong network selected"));
    assert.strictEqual(result.code, WalletErrorCode.NETWORK_MISMATCH);
  });

  test("UNKNOWN: maps unrecognised error to generic fallback", () => {
    const result = getWalletError(new Error("some completely unexpected sdk error"));
    assert.strictEqual(result.code, WalletErrorCode.UNKNOWN);
    assert.strictEqual(result.message, "Something went wrong connecting your wallet.");
  });

  test("UNKNOWN: handles null gracefully", () => {
    const result = getWalletError(null);
    assert.strictEqual(result.code, WalletErrorCode.UNKNOWN);
  });

  test("each error code has non-empty help text", () => {
    Object.values(WalletErrorCode).forEach((code) => {
      const result = getWalletError(
        code === WalletErrorCode.USER_DECLINED ? new Error("declined") :
        code === WalletErrorCode.NOT_INSTALLED ? new Error("not found") :
        code === WalletErrorCode.NETWORK_MISMATCH ? new Error("network mismatch") :
        null
      );
      assert.ok(result.help.length > 0, `help text missing for ${code}`);
    });
  });
});

describe("translateStellarError", () => {
  test("maps Soroban contract error code 1 to InvalidAmount", () => {
    const error = { code: 1 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.INVALID_AMOUNT);
  });

  test("maps Soroban contract error code 2 to InsufficientFunding", () => {
    const error = { code: 2 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.INSUFFICIENT_FUNDING);
  });

  test("maps Soroban contract error code 3 to Unauthorized", () => {
    const error = { code: 3 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.UNAUTHORIZED);
  });

  test("maps Soroban contract error code 4 to DeadlineNotReached", () => {
    const error = { code: 4 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.DEADLINE_NOT_REACHED);
  });

  test("maps Soroban contract error code 5 to ShareSumExceedsRent", () => {
    const error = { code: 5 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.SHARE_SUM_EXCEEDS_RENT);
  });

  test("maps Soroban contract error code 6 to NothingToRefund", () => {
    const error = { code: 6 };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.NOTHING_TO_REFUND);
  });

  test("maps RPC timeout error message", () => {
    const error = { message: "Request Timeout" };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.RPC_NETWORK_TIMEOUT);
  });

  test("maps RPC connection error (node unavailable)", () => {
    const error = { message: "Failed to fetch node status" };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.RPC_NODE_UNAVAILABLE);
  });

  test("maps Freighter rejection message", () => {
    const error = "User declined transaction";
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.FREIGHTER_REJECTED);
  });

  test("maps Freighter locked wallet message", () => {
    const error = { message: "Account is locked" };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.FREIGHTER_LOCKED);
  });

  test("handles unknown errors gracefully", () => {
    const error = { something: "went wrong" };
    const result = translateStellarError(error);
    expect(result.type).toBe(StellarErrorType.UNKNOWN);
    expect(result.message).toBe("An unexpected Stellar error occurred.");
  });

  test("handles null error", () => {
    const result = translateStellarError(null);
    expect(result.type).toBe(StellarErrorType.UNKNOWN);
  });
});
