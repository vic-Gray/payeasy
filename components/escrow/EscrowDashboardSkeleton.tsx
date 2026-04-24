"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the three-column layout of the escrow dashboard:
 * 1. EscrowStatus card (full width)
 * 2. FundingProgress + Protocol Secured card (2-col grid)
 * 3. RoommateList (full width)
 */
export default function EscrowDashboardSkeleton() {
  return (
    <div className="space-y-12">
      {/* EscrowStatus card */}
      <div className="glass-card p-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-3">
            <Skeleton width={120} height={10} />
            <Skeleton width={180} height={28} rounded />
          </div>
          <div className="space-y-2 md:text-right">
            <Skeleton width={100} height={10} />
            <Skeleton width={160} height={48} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-start gap-5">
              <Skeleton width={52} height={52} rounded />
              <div className="space-y-2 flex-1">
                <Skeleton width={100} height={10} />
                <Skeleton width="100%" height={32} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FundingProgress + Protocol Secured */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FundingProgress */}
        <div className="glass-card p-8 space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-3">
              <Skeleton width={120} height={10} />
              <Skeleton width={100} height={48} />
            </div>
            <Skeleton width={72} height={72} rounded />
          </div>
          <Skeleton width="100%" height={24} className="rounded-3xl" />
          <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-white/5 border border-white/5">
            <div className="space-y-2">
              <Skeleton width={80} height={10} />
              <Skeleton width={100} height={28} />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <Skeleton width={80} height={10} />
              <Skeleton width={100} height={28} />
            </div>
          </div>
        </div>

        {/* Protocol Secured placeholder */}
        <div className="glass-card p-10 flex flex-col items-center justify-center gap-8">
          <Skeleton width={88} height={88} rounded />
          <div className="space-y-3 flex flex-col items-center w-full">
            <Skeleton width={200} height={20} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="60%" height={14} />
          </div>
          <Skeleton width={160} height={40} className="rounded-2xl" />
        </div>
      </div>

      {/* RoommateList */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <Skeleton width={40} height={40} className="rounded-xl" />
            <div className="space-y-2">
              <Skeleton width={160} height={12} />
              <Skeleton width={100} height={10} />
            </div>
          </div>
          <Skeleton width={40} height={40} rounded />
        </div>

        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex items-center gap-5 min-w-0">
                <Skeleton width={56} height={56} className="rounded-3xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton width={220} height={14} />
                  <Skeleton width={120} height={20} className="rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-10 ml-auto shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-10">
                <div className="space-y-2 flex flex-col items-end">
                  <Skeleton width={80} height={10} />
                  <Skeleton width={120} height={28} />
                  <Skeleton width={100} height={18} />
                </div>
                <Skeleton width={44} height={44} className="rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
