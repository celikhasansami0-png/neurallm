import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  low: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
  medium: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
  high: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  completed: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
  running: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]",
  awaiting_approval: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
  pending: "bg-[#F5F5F5] text-[#404040] border-[#E5E5E5]",
  rejected: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  indexed: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
  processing: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
};

export function Badge({ value, children }: { value: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize", STYLES[value] || STYLES.pending)}>
      {children || value.replace(/_/g, " ")}
    </span>
  );
}
