export default function DressingUnitLoading() {
  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-brand-warm">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-brand-beige/40 rounded-2xl animate-pulse" />
          <div className="absolute inset-2 border-4 border-brand-accent/30 border-t-brand-accent rounded-xl animate-spin" />
        </div>
        <div>
          <p className="text-brand-dark font-display text-lg tracking-wide">Se încarcă configuratorul</p>
          <p className="text-brand-charcoal/40 text-sm mt-1">Pregătim scena 3D...</p>
        </div>
        <div className="flex items-center justify-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
