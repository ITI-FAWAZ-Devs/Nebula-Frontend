import type { LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export interface AdminPagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function AdminPagePlaceholder({
  title,
  description,
  icon: Icon,
}: AdminPagePlaceholderProps) {
  return (
    <Empty className="border-white/10 p-12">
      <EmptyMedia
        variant="icon"
        className="size-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 [&>svg]:size-7"
      >
        <Icon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-base font-semibold text-white">
          {title}
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/30">
        Module under construction
      </span>
    </Empty>
  );
}
