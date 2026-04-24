"use client";

import { ChevronDown } from "lucide-react";

import {
  SUPPORTED_TOKENS,
  type SupportedToken,
} from "@/lib/stellar/config";

interface TokenSelectProps {
  id?: string;
  value: string;
  tokens?: SupportedToken[];
  onChange: (token: SupportedToken) => void;
}

export default function TokenSelect({
  id = "token-address",
  value,
  tokens = SUPPORTED_TOKENS,
  onChange,
}: TokenSelectProps) {
  const selectedToken =
    tokens.find((token) => token.issuer === value) ?? null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const nextToken = tokens.find(
              (token) => token.issuer === event.target.value
            );
            if (nextToken) {
              onChange(nextToken);
            }
          }}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-dark-100 focus:border-brand-400 focus:outline-none"
        >
          <option value="" disabled>
            Select a supported token
          </option>
          {tokens.map((token) => (
            <option key={token.issuer} value={token.issuer}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500"
          aria-hidden="true"
        />
      </div>

      {selectedToken ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-dark-100">
                {selectedToken.name}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-300">
                {selectedToken.symbol}
              </p>
            </div>
            <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-100">
              {selectedToken.assetCode}
            </span>
          </div>
          <p className="mt-3 break-all font-mono text-xs text-dark-400">
            Issuer: {selectedToken.issuer}
          </p>
        </div>
      ) : (
        <p className="text-xs text-dark-500">
          Choose from the supported Stellar testnet assets.
        </p>
      )}
    </div>
  );
}
