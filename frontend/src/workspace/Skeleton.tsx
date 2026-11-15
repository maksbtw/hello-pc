import type { CSSProperties, ReactNode } from 'react';

/**
 * Skeleton building blocks. A point's Skeleton is shown only while the camera flies past
 * it, so it must be cheap: no logic, no data, no glass blur. Just its rough shape.
 */

export function SkBox({
  className = '',
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-xl bg-surface/40 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SkLine({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`h-3.5 rounded-pill bg-surface-overlay/60 ${className}`} style={style} />;
}
