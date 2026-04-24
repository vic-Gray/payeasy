import test from "node:test";
import assert from "node:assert/strict";

import { SUPPORTED_TOKENS } from "../../lib/stellar/config.ts";
import { assignSupportedToken, type EscrowFormDraft } from "./createEscrowForm.helpers.ts";

const BLANK_DRAFT: EscrowFormDraft = {
  totalRent: "",
  tokenAddress: "",
  deadlineDate: "",
  roommates: [],
};

test("SUPPORTED_TOKENS contains USDC with a testnet issuer address", () => {
  const usdc = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
  assert.ok(usdc, "USDC must be in SUPPORTED_TOKENS");
  assert.ok(usdc.issuer.length > 0, "USDC issuer must not be empty");
  assert.strictEqual(usdc.assetCode, "USDC");
});

test("SUPPORTED_TOKENS contains EURC with a testnet issuer address", () => {
  const eurc = SUPPORTED_TOKENS.find((t) => t.symbol === "EURC");
  assert.ok(eurc, "EURC must be in SUPPORTED_TOKENS");
  assert.ok(eurc.issuer.length > 0, "EURC issuer must not be empty");
  assert.strictEqual(eurc.assetCode, "EURC");
});

for (const token of SUPPORTED_TOKENS) {
  test(`selecting ${token.symbol} sets tokenAddress to its issuer`, () => {
    const updated = assignSupportedToken(BLANK_DRAFT, token);
    assert.strictEqual(
      updated.tokenAddress,
      token.issuer,
      `tokenAddress must equal ${token.symbol} issuer after selection`
    );
  });
}

test("selecting USDC stores the correct testnet issuer in form state", () => {
  const usdc = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC");
  assert.ok(usdc);
  const updated = assignSupportedToken(BLANK_DRAFT, usdc);
  assert.strictEqual(updated.tokenAddress, usdc.issuer);
});

test("assignSupportedToken does not mutate other draft fields", () => {
  const draft: EscrowFormDraft = {
    totalRent: "1500",
    tokenAddress: "",
    deadlineDate: "2026-06-01",
    roommates: [{ id: "r1", address: "GABC", shareAmount: "1500" }],
  };
  const token = SUPPORTED_TOKENS[0];
  const updated = assignSupportedToken(draft, token);
  assert.strictEqual(updated.totalRent, draft.totalRent);
  assert.strictEqual(updated.deadlineDate, draft.deadlineDate);
  assert.deepStrictEqual(updated.roommates, draft.roommates);
});
