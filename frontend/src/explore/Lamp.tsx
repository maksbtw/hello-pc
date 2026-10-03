/**
 * Wisząca lampa „scenowa" (wg Figmy, node 9:525): kabel → trapezowy klosz →
 * świecąca listwa LED, pod nią stożek ciepłego światła w dół i plama na podłodze.
 * Czysty CSS (offline), kolory z design systemu (orange/81 #FFD9A0, orange/88
 * #FFE7C2, azure/19 #2A2F37). Dekoracja — pointer-events wyłączone, siedzi za
 * Canvasem (przezroczystym), więc model 3D jest „oświetlony" od góry.
 */
export default function Lamp() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Stożek światła z lampy w dół */}
      <div
        className="absolute left-1/2 top-0 h-[85%] w-[70%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(58% 80% at 50% 0%, rgba(255,217,160,0.22), rgba(255,217,160,0.08) 34%, rgba(255,217,160,0) 70%)',
        }}
      />
      {/* Plama światła na podłodze */}
      <div
        className="absolute bottom-[8%] left-1/2 h-[14%] w-[56%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(255,217,160,0.14), rgba(255,217,160,0) 70%)',
        }}
      />

      {/* Oprawa lampy: kabel + klosz + świetlówka */}
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
        {/* kabel */}
        <div className="h-3.5 w-0.5 bg-border-strong" />
        {/* klosz — trapez zwężający się ku górze */}
        <div
          className="h-[18px] w-[150px]"
          style={{
            background: 'linear-gradient(#2B3038, #1A1E25)',
            clipPath: 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)',
          }}
        />
        {/* świetlówka — ciepłe źródło światła z poświatą */}
        <div
          className="-mt-0.5 h-1 w-[112px] rounded-full"
          style={{
            background: '#FFE7C2',
            boxShadow:
              '0 0 8px 2px rgba(255,231,194,0.9), 0 0 24px 8px rgba(255,217,160,0.55), 0 6px 40px 12px rgba(255,217,160,0.35)',
          }}
        />
      </div>
    </div>
  );
}
