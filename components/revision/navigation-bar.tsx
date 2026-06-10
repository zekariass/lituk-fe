"use client";

interface NavigationBarProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
}

export function NavigationBar({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
}: NavigationBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="rounded-md border border-border px-4 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-green-600/30 hover:bg-green-500/30"
      >
        {previousLabel}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 bg-green-600/30 hover:bg-green-600/30"
      >
        {nextLabel}
      </button>
    </div>
  );
}
