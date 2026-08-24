"use client";

import React from "react";

export function PropertyCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between h-[420px] border border-white/5 bg-white/[0.02] animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-52 w-full bg-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        {/* Fake Badges */}
        <div className="absolute top-4 left-4 h-5 w-16 rounded-full bg-white/10" />
        <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10" />
        <div className="absolute bottom-4 right-4 h-5 w-14 rounded-full bg-white/10" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="h-5 w-3/4 rounded-lg bg-white/10" />
          <div className="h-3 w-1/2 rounded-lg bg-white/5" />
        </div>

        {/* Feature Icons Skeleton */}
        <div className="flex gap-4 my-4 border-y border-white/5 py-2.5">
          <div className="h-4 w-12 rounded bg-white/10" />
          <div className="h-4 w-12 rounded bg-white/10" />
          <div className="h-4 w-16 rounded bg-white/10" />
        </div>

        {/* Price & Action Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 rounded-lg bg-white/10" />
          <div className="h-8 w-24 rounded-xl bg-white/10" />
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
