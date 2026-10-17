import { levelLabel, type PrepLevel } from "@/lib/prep-trek-content";

// Visible text tag for who a card is written for. Text, never colour-only.
export default function LevelTag({
  level,
  className = "",
}: {
  level: PrepLevel;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border border-ink/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/70 ${className}`}
    >
      <span className="sr-only">Level: </span>
      {levelLabel[level]}
    </span>
  );
}
