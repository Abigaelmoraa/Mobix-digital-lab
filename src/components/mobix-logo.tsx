type MobixLogoProps = {
  inverse?: boolean;
  className?: string;
};

export function MobixLogo({ inverse = false, className = "" }: MobixLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative flex size-12 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold ${
          inverse ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
        }`}
      >
        MØ
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-secondary" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-2xl font-bold tracking-tight ${
            inverse ? "text-ink-foreground" : "text-primary"
          }`}
        >
          MØBIX
        </span>
        <span className="mt-1 text-sm font-semibold text-secondary">Digital Lab</span>
      </span>
    </span>
  );
}
