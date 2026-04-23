"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

import { isValidStellarAddress } from "@/lib/stellar/validation";
import type { RoommateInputValue } from "./createEscrowForm.helpers";

type AddressValidation = "idle" | "valid" | "invalid";

const VALIDATION_DEBOUNCE_MS = 300;

interface RoommateInputProps {
  roommate: RoommateInputValue;
  index: number;
  onChange: (
    roommateId: string,
    field: "address" | "shareAmount",
    value: string
  ) => void;
  onRemove: (roommateId: string) => void;
  disableRemove: boolean;
}

export default function RoommateInput({
  roommate,
  index,
  onChange,
  onRemove,
  disableRemove,
}: RoommateInputProps) {
  const [addressValidation, setAddressValidation] = useState<AddressValidation>(
    () =>
      roommate.address
        ? isValidStellarAddress(roommate.address)
          ? "valid"
          : "invalid"
        : "idle"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function runValidation(value: string): void {
    const trimmed = value.trim();
    if (!trimmed) {
      setAddressValidation("idle");
      return;
    }
    setAddressValidation(isValidStellarAddress(trimmed) ? "valid" : "invalid");
  }

  function handleAddressBlur(event: React.FocusEvent<HTMLInputElement>): void {
    const value = event.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runValidation(value);
    }, VALIDATION_DEBOUNCE_MS);
  }

  const errorId = `roommate-address-${roommate.id}-error`;
  const isInvalid = addressValidation === "invalid";
  const isValid = addressValidation === "valid";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dark-200">Roommate {index + 1}</h3>
        <button
          type="button"
          onClick={() => onRemove(roommate.id)}
          disabled={disableRemove}
          className="text-xs px-3 py-1 rounded-md border border-white/10 text-dark-400 hover:text-dark-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>

      <div className="space-y-2">
        <label
          className="block text-xs uppercase tracking-wide text-dark-500"
          htmlFor={`roommate-address-${roommate.id}`}
        >
          Wallet Address
        </label>
        <div className="relative">
          <input
            id={`roommate-address-${roommate.id}`}
            type="text"
            value={roommate.address}
            onChange={(event) =>
              onChange(roommate.id, "address", event.target.value)
            }
            onBlur={handleAddressBlur}
            placeholder="G..."
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? errorId : undefined}
            className={`w-full rounded-xl border bg-white/5 px-3 py-2 pr-9 text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none ${
              isInvalid
                ? "border-red-400/70 focus:border-red-400"
                : isValid
                  ? "border-accent-400/60 focus:border-accent-400"
                  : "border-white/10 focus:border-brand-400"
            }`}
          />
          {isValid ? (
            <Check
              data-testid={`roommate-address-${roommate.id}-valid`}
              aria-label="Valid Stellar address"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-300"
            />
          ) : null}
        </div>
        {isInvalid ? (
          <p id={errorId} className="text-xs text-red-300">
            Enter a valid Stellar address (56 characters, starts with G or C).
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wide text-dark-500" htmlFor={`roommate-share-${roommate.id}`}>
          Share Amount
        </label>
        <input
          id={`roommate-share-${roommate.id}`}
          type="number"
          min="0"
          step="0.0000001"
          value={roommate.shareAmount}
          onChange={(event) => onChange(roommate.id, "shareAmount", event.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-600 focus:border-brand-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
