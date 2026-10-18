// Shared "Free" / "Premium available" label for Prep Trek cards.
// Always real text (never colour-only) so it reads the same for everyone.
export type Access = "free" | "premium";

const LABEL: Record<Access, string> = {
  free: "Free",
  premium: "Premium available",
};

const STYLE: Record<Access, string> = {
  free: "border border-board/40 bg-white text-denim",
  premium: "bg-mustard text-paper",
};

export default function AccessBadge({
  access,
  className = "",
}: {
  access: Access;
  className?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${STYLE[access]} ${className}`}
    >
      {LABEL[access]}
    </span>
  );
}
