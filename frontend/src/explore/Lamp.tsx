/**
 * Hanging scene lamp: cord → trapezoid shade → glowing LED bar, with a cone of
 * cold light below and a light spot on the floor. Pure CSS, colors from tokens.
 * Decoration only (no pointer events); sits behind the transparent Canvas so the
 * 3D model looks lit from above.
 */
export default function Lamp() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Light cone */}
      <div
        className="absolute left-1/2 top-0 h-[85%] w-[70%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(58% 80% at 50% 0%, rgb(var(--lamp-rgb) / 0.2), rgb(var(--lamp-rgb) / 0.07) 34%, rgb(var(--lamp-rgb) / 0) 70%)',
        }}
      />
      {/* Light spot on the floor */}
      <div
        className="absolute bottom-[8%] left-1/2 h-[14%] w-[56%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgb(var(--lamp-rgb) / 0.12), rgb(var(--lamp-rgb) / 0) 70%)',
        }}
      />

      {/* Fixture: cord + shade + LED bar */}
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
        <div className="h-3.5 w-0.5 bg-border-strong" />
        <div
          className="h-[18px] w-[150px]"
          style={{
            background: 'linear-gradient(var(--surface-overlay), var(--surface))',
            clipPath: 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)',
          }}
        />
        <div
          className="-mt-0.5 h-1 w-[112px] rounded-full"
          style={{
            background: 'var(--lamp-soft)',
            boxShadow:
              '0 0 8px 2px rgb(var(--lamp-soft-rgb) / 0.9), 0 0 24px 8px rgb(var(--lamp-rgb) / 0.5), 0 6px 40px 12px rgb(var(--lamp-rgb) / 0.3)',
          }}
        />
      </div>
    </div>
  );
}
