"use client";

import React from "react";

type GlassCardProps = React.PropsWithChildren<{
  className?: string;
  padded?: boolean;
}>;

export default function GlassCard({ children, className, padded = true }: GlassCardProps) {
  return (
    <div className={["glass", className].filter(Boolean).join(" ")}
         style={{ padding: padded ? 12 : 0 }}>
      {children}
    </div>
  );
}

