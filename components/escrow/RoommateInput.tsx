"use client";

import { useMemo } from "react";
import type { RoommateInputValue } from "./createEscrowForm.helpers";
import { FieldError, fieldBorderClass } from "@/components/ui/field-error";

type AddressValidation = "idle" | "valid" | "invalid";

const VALIDATION_DEBOUNCE_MS = 300;

interface RoommateInputProps {
  roommate: RoommateInputValue;
  index: number;
  totalRent: string;
  onChange: (
    roommateId: string,
    field: "address" | "shareAmount",
    value: string
  ) => void;
  onRemove: (roommateId: string) => void;
  disableRemove: boolean;
  errors?: { address?: string; shareAmount?: string };
  onClearError?: (roommateId: string, field: "address" | "shareAmount") => void;
}

export default function RoommateInput({
  roommate,
  index,
  totalRent,
  onChange,
  onRemove,
  disableRemove,
  errors = {},
  onClearError,
}: RoommateInputProps) {
  const percentage = useMemo(() => {
    const total = parseFloat(totalRent);
    const share = parseFloat(roommate.shareAmount);
    if (isNaN(total) || isNaN(share) || total === 0) return null;
    return ((share / total) * 100).toFixed(1);
  }, [totalRent, roommate.shareAmount]);

  const addressErrorId = `roommate-address-error-${roommate.id}`;
  const shareErrorId = `roommate-share-error-${roommate.id}`;

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

      <div className="space-y-1">
        <label
          className="block text-xs uppercase tracking-wide text-dark-500"
          htmlFor={`roommate-address-${roommate.id}`}
        >
          Wallet Address
        </label>
        <input
          id={`roommate-address-${roommate.id}`}
          type="text"
          value={roommate.address}
          onChange={(event) => {
            onChange(roommate.id, "address", event.target.value);
            if (event.target.value.trim()) onClearError?.(roommate.id, "address");
          }}
          placeholder="G..."
          aria-describedby={errors.address ? addressErrorId : undefined}
          aria-invalid={!!errors.address}
          className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none transition-colors ${fieldBorderClass(errors.address, !!roommate.address.trim())}`}
        />
        <FieldError id={addressErrorId} message={errors.address} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            className="block text-xs uppercase tracking-wide text-dark-500"
            htmlFor={`roommate-share-${roommate.id}`}
          >
            Share Amount
          </label>
          {percentage !== null && (
            <span className="text-xs font-medium text-brand-300">({percentage}%)</span>
          )}
        </div>
        <input
          id={`roommate-share-${roommate.id}`}
          type="number"
          min="0"
          step="0.0000001"
          value={roommate.shareAmount}
          onChange={(event) => {
            onChange(roommate.id, "shareAmount", event.target.value);
            if (event.target.value && Number(event.target.value) > 0) onClearError?.(roommate.id, "shareAmount");
          }}
          placeholder="0"
          aria-describedby={errors.shareAmount ? shareErrorId : undefined}
          aria-invalid={!!errors.shareAmount}
          className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none transition-colors ${fieldBorderClass(errors.shareAmount, !!roommate.shareAmount && Number(roommate.shareAmount) > 0)}`}
        />
        <FieldError id={shareErrorId} message={errors.shareAmount} />
      </div>
    </div>
  );
}
