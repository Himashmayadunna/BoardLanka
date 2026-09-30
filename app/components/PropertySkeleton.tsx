"use client";

import React from "react";

export function PropertyCardSkeleton() {
  return (
    <div className="border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden flex flex-col justify-between h-[420px] animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-52 w-full bg-[var(--surface-subtle)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--foreground)]/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        {/* Fake Badges */}
        <div className="absolute top-4 left-4 h-4 w-16 bg-[var(--surface)] border border-[var(--border-hairline)]" />
        <div className="absolute top-4 right-4 h-6 w-6 bg-[var(--surface)] border border-[var(--border-hairline)]" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-[var(--surface-subtle)]" />
          <div className="h-3 w-1/2 bg-[var(--surface-subtle)]" />
        </div>

        {/* Feature Icons Skeleton */}
        <div className="flex gap-4 border-y border-[var(--border-hairline)] py-3">
          <div className="h-4 w-12 bg-[var(--surface-subtle)]" />
          <div className="h-4 w-12 bg-[var(--surface-subtle)]" />
          <div className="h-4 w-16 bg-[var(--surface-subtle)]" />
        </div>

        {/* Price & Action Skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-24 bg-[var(--surface-subtle)]" />
          <div className="h-4 w-16 bg-[var(--surface-subtle)]" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default PropertyGridSkeleton;
