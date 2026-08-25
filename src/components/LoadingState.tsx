export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl text-center z-10 p-12 relative w-full mx-auto">
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 border border-outline/30 rounded-full animate-[spin_4s_linear_infinite]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-fixed"></div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-fixed"></div>
        </div>
        <div className="absolute inset-4 border border-outline/20 rounded-full animate-[spin_3s_linear_infinite_reverse]">
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-on-surface-variant"></div>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-on-surface-variant"></div>
        </div>
        <div className="w-12 h-12 bg-surface-container-high border border-primary-fixed/50 rounded flex items-center justify-center relative z-10">
          <span className="material-symbols-outlined text-[24px] text-primary-fixed animate-pulse">sync</span>
        </div>
      </div>
      <h3 className="font-body-lg text-body-lg text-on-surface mb-2 tracking-widest font-mono">SYNCHRONIZING WITH GENLAYER</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-primary-fixed animate-pulse"></span>
        <span className="font-code-sm text-code-sm text-on-surface-variant">VERIFYING BLOCK HEADERS...</span>
      </div>
      <div className="w-full max-w-xs h-1 bg-surface-container relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-primary-fixed animate-[translateX_2s_ease-in-out_infinite]"></div>
      </div>
      <style>{`
        @keyframes translateX {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
