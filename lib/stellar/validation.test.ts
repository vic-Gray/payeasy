import test from "node:test";
import assert from "node:assert/strict";

import { isValidStellarAddress } from "./validation.ts";

const VALID_ADDRESSES: string[] = [
  // G-prefixed account addresses (56 chars, chars in [A-Z2-7])
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
  "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
  "GCKFBEIYTKP5RCIYHNKWYS4QN3W6WBZGBJ76WUFMKPWBTFEW6DQO2QEM",
  "GCVHVZLDGJ2YDKGZMOU2GHSEYTVFVWMMBHXDQTNNM5TJQY3SCFFEJYHT",
  "GAIXIJBMYPTSF2CJVQ4NEKVTCF6WOPWPIDE3ZBSFOYHHMWIBTG2J5TAY",
  // C-prefixed contract-style addresses (same length/charset rules)
  "CAIXIJBMYPTSF2CJVQ4NEKVTCF6WOPWPIDE3ZBSFOYHHMWIBTG2J5TAX",
  "CCKFBEIYTKP5RCIYHNKWYS4QN3W6WBZGBJ76WUFMKPWBTFEW6DQO2QEM",
  "CDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
];

const INVALID_ADDRESSES: string[] = [
  "",
  "GABCDE",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZV",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVNX",
  "XA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  "ga5zsejyb37jrc5avcia5mop4rhtm335x2kgx3ihojapp5re34k4kzvn",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZV0",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZV1",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZV!",
  "  GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZ",
];

test("valid fixtures are exactly 56 chars and start with G or C", () => {
  assert.strictEqual(VALID_ADDRESSES.length, 10);
  for (const addr of VALID_ADDRESSES) {
    assert.strictEqual(
      addr.length,
      56,
      `expected length 56 for fixture: ${addr} (got ${addr.length})`
    );
    assert.match(addr, /^[GC]/, `expected G/C prefix on fixture: ${addr}`);
  }
});

test("invalid fixtures cover expected failure modes", () => {
  assert.strictEqual(INVALID_ADDRESSES.length, 10);
});

for (const addr of VALID_ADDRESSES) {
  test(`isValidStellarAddress accepts ${addr.slice(0, 6)}…${addr.slice(-4)}`, () => {
    assert.strictEqual(
      isValidStellarAddress(addr),
      true,
      `expected VALID for ${addr}`
    );
  });
}

for (const addr of INVALID_ADDRESSES) {
  test(`isValidStellarAddress rejects ${JSON.stringify(addr.slice(0, 24))}`, () => {
    assert.strictEqual(
      isValidStellarAddress(addr),
      false,
      `expected INVALID for ${addr}`
    );
  });
}

test("GABCDE (spec example) is invalid", () => {
  assert.strictEqual(isValidStellarAddress("GABCDE"), false);
});

test("non-string inputs are rejected", () => {
  assert.strictEqual(
    isValidStellarAddress(undefined as unknown as string),
    false
  );
  assert.strictEqual(isValidStellarAddress(null as unknown as string), false);
  assert.strictEqual(isValidStellarAddress(123 as unknown as string), false);
});
