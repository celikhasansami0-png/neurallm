import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  low: "bg-[#1A2E1F] text-[#22C55E] border-[#22C55E]/30",
  medium: "bg-[#2E2410] text-[#F59E0B] border-[#F59E0B]/30",
  high: "bg-[#2E1414] text-[#F87171] border-[#F87171]/30",
  completed: "bg-[#1A2E1F] text-[#22C55E] border-[#22C55E]/30",
  running: "bg-[#1A1A1A] text-[#FFFFFF] border-[#333333]",
  awaiting_approval: "bg-[#2E2410] text-[#F59E0B] border-[#F59E0B]/30",
  needs_approval: "bg-[#2E2410] text-[#F59E0B] border-[#F59E0B]/30",
  pending: "bg-[#1A1A1A] text-[#444444] border-[#1A1A1A]",
  rejected: "bg-[#2E1414] text-[#F87171] border-[#F87171]/30",
  failed: "bg-[#2E1414] text-[#F87171] border-[#F87171]/30",
  indexed: "bg-[#1A2E1F] text-[#22C55E] border-[#22C55E]/30",
  processing: "bg-[#2E2410] text-[#F59E0B] border-[#F59E0B]/30",
  active: "bg-[#1A2E1F] text-[#22C55E] border-[#22C55E]/30",
};

export function Badge({ value, children }: { value: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize", STYLES[value] || STYLES.pending)}>
      {children || value.replace(/_/g, " ")}
    </span>
  );
}
