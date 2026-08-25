export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl text-center z-10 p-12 bg-surface-container border border-outline/30 relative overflow-hidden group hover:border-primary-fixed transition-colors duration-500 mx-auto w-full">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline/50 flex items-center justify-center mb-8 relative">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary-fixed transition-colors">folder_off</span>
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-outline/50"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-outline/50"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-outline/50"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-outline/50"></div>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 tracking-tight">NO CLAIMS DETECTED</h2>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8 font-mono">
        SYSTEM STATUS: INACTIVE. CREATE YOUR FIRST CLAIM TO INITIATE VERIFICATION AND SECURE YOUR OPEN-SOURCE LICENSES ON THE LEDGER.
      </p>
      <button className="bg-primary-fixed text-on-primary-fixed px-8 py-3 font-label-caps text-label-caps hover:bg-primary-fixed-dim transition-all flex items-center gap-2 group/btn relative overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          INITIALIZE CLAIM
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
      </button>
      <div className="absolute top-4 left-4 flex gap-1">
        <div className="w-1 h-1 bg-outline/50"></div>
        <div className="w-1 h-1 bg-outline/50"></div>
        <div className="w-1 h-1 bg-outline/50"></div>
      </div>
      <div className="absolute bottom-4 right-4 font-code-sm text-code-sm text-on-surface-variant/50">
        [SYS_ERR_001_EMPTY_SET]
      </div>
    </div>
  );
}
